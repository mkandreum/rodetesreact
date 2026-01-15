import express, { Request, Response } from 'express';
import pool from '../database/db';
import { requireAdmin } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all sales (Admin)
router.get('/sales', requireAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM merch_sales ORDER BY sale_date DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

// CREATE Merch Sale (Public)
router.post('/buy', async (req: Request, res: Response) => {
    try {
        const { merch_item_id, quantity, nombre, apellidos, email } = req.body;

        // Validation
        if (!merch_item_id || !quantity || !email) {
            res.status(400).json({ error: 'Missing fields' });
            return;
        }

        // Get item details
        const itemResult = await pool.query(`
      SELECT m.*, d.name as drag_name 
      FROM merch_items m 
      LEFT JOIN drags d ON m.drag_id = d.id 
      WHERE m.id = $1
    `, [merch_item_id]);

        if (itemResult.rows.length === 0) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        const item = itemResult.rows[0];
        const saleId = uuidv4();

        // Insert sale
        const result = await pool.query(
            `INSERT INTO merch_sales 
       (sale_id, merch_item_id, drag_id, drag_name, item_name, item_price, quantity, nombre, apellidos, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [
                saleId,
                item.id,
                item.drag_id,
                item.drag_name,
                item.name,
                item.price,
                quantity,
                nombre,
                apellidos,
                email
            ]
        );

        res.json({ success: true, sale: result.rows[0] });

    } catch (error) {
        console.error('Merch sale error:', error);
        res.status(500).json({ error: 'Sales failed' });
    }
});

// UPDATE Sale Status (Admin)
router.patch('/sales/:id/status', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Delivered' etc.

        await pool.query(
            'UPDATE merch_sales SET status = $1, delivered_at = CURRENT_TIMESTAMP WHERE id = $2',
            [status, id]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// --- MERCH ITEMS CRUD (Admin) ---

// CREATE Item
router.post('/items', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { name, price, image_url, drag_id } = req.body;
        const result = await pool.query(
            'INSERT INTO merch_items (name, price, image_url, drag_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, image_url, drag_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// DELETE Item
router.delete('/items/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM merch_items WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;
