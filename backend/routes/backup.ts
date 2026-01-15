import express, { Request, Response } from 'express';
import pool from '../database/db';
import { requireAdmin } from '../middleware/auth';
import JSZip from 'jszip';

const router = express.Router();

// GET Full Backup (Admin)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
    try {
        const zip = new JSZip();

        // Fetch data
        const [events, drags, merchItems, sales, tickets, settings] = await Promise.all([
            pool.query('SELECT * FROM events'),
            pool.query('SELECT * FROM drags'),
            pool.query('SELECT * FROM merch_items'),
            pool.query('SELECT * FROM merch_sales'),
            pool.query('SELECT * FROM tickets'),
            pool.query('SELECT * FROM app_settings')
        ]);

        // Add to ZIP
        zip.file('events.json', JSON.stringify(events.rows, null, 2));
        zip.file('drags.json', JSON.stringify(drags.rows, null, 2));
        zip.file('merch_items.json', JSON.stringify(merchItems.rows, null, 2));
        zip.file('merch_sales.json', JSON.stringify(sales.rows, null, 2));
        zip.file('tickets.json', JSON.stringify(tickets.rows, null, 2));
        zip.file('settings.json', JSON.stringify(settings.rows, null, 2));

        const content = await zip.generateAsync({ type: 'nodebuffer' });

        const filename = `rodetes_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${filename}`);
        res.set('Content-Length', content.length.toString());
        res.send(content);

    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Backup failed' });
    }
});

export default router;
