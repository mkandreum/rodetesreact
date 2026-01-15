import express, { Request, Response } from 'express';
import pool from '../database/db';
import { requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all tickets (Admin only)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT t.*, e.name as event_name, s.scanned_count 
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      LEFT JOIN scanned_tickets s ON t.ticket_id = s.ticket_id
      ORDER BY t.created_at DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// CREATE new ticket (Public purchase)
router.post('/', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { event_id, nombre, apellidos, email, quantity } = req.body;

        if (!event_id || !nombre || !email || !quantity) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check event capacity
        const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [event_id]);
        if (eventResult.rows.length === 0) {
            throw new Error('Event not found');
        }

        const event = eventResult.rows[0];
        if (event.tickets_sold + quantity > event.ticket_capacity && event.ticket_capacity > 0) {
            throw new Error('Sold out');
        }

        const createdTickets = [];

        // Create tickets
        for (let i = 0; i < quantity; i++) {
            const ticketId = uuidv4();
            const result = await client.query(
                `INSERT INTO tickets (ticket_id, event_id, nombre, apellidos, email, quantity)
         VALUES ($1, $2, $3, $4, $5, 1)
         RETURNING *`,
                [ticketId, event_id, nombre, apellidos, email]
            );
            createdTickets.push(result.rows[0]);
        }

        // Update event sold count
        await client.query(
            `UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2`,
            [quantity, event_id]
        );

        await client.query('COMMIT');
        res.json({ success: true, tickets: createdTickets });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error purchasing tickets:', error);
        res.status(500).json({ error: error.message || 'Purchase failed' });
    } finally {
        client.release();
    }
});

// SCAN ticket (Admin)
router.post('/scan', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { ticket_id } = req.body;

        // Check if ticket exists
        const ticketResult = await pool.query(
            `SELECT t.*, e.name as event_name 
       FROM tickets t 
       JOIN events e ON t.event_id = e.id 
       WHERE t.ticket_id = $1`,
            [ticket_id]
        );

        if (ticketResult.rows.length === 0) {
            res.status(404).json({ error: 'Ticket invalid' });
            return;
        }

        const ticket = ticketResult.rows[0];

        // Check if already scanned
        const scanResult = await pool.query(
            'SELECT * FROM scanned_tickets WHERE ticket_id = $1',
            [ticket_id]
        );

        if (scanResult.rows.length > 0) {
            const scanData = scanResult.rows[0];
            res.json({
                success: false,
                status: 'already_used',
                message: 'Ticket already used',
                ticket: ticket,
                scanned_at: scanData.last_scanned_at
            });
            return;
        }

        // Mark as scanned
        await pool.query(
            `INSERT INTO scanned_tickets (ticket_id, scanned_count, last_scanned_at)
       VALUES ($1, 1, CURRENT_TIMESTAMP)`,
            [ticket_id]
        );

        res.json({
            success: true,
            status: 'valid',
            message: 'Access granted',
            ticket: ticket
        });

    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ error: 'Scan failed' });
    }
});

// DELETE ticket (Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // Get ticket info to decrement event count
        const ticketRes = await client.query('SELECT event_id FROM tickets WHERE id = $1', [id]);
        if (ticketRes.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        const eventId = ticketRes.rows[0].event_id;

        // Delete ticket
        await client.query('DELETE FROM tickets WHERE id = $1', [id]);

        // Update event count
        await client.query('UPDATE events SET tickets_sold = tickets_sold - 1 WHERE id = $1', [eventId]);

        await client.query('COMMIT');
        res.json({ success: true });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    } finally {
        client.release();
    }
});

export default router;
