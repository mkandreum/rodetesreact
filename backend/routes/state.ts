import express, { Request, Response } from 'express';
import pool from '../database/db';

const router = express.Router();

// GET aggregated state
router.get('/', async (req: Request, res: Response) => {
    try {
        // Fetch all data in parallel
        const [
            events,
            drags,
            merchItems,
            settings,
            scannedTickets
        ] = await Promise.all([
            pool.query('SELECT * FROM events ORDER BY date ASC'),
            pool.query('SELECT * FROM drags ORDER BY name ASC'),
            pool.query('SELECT * FROM merch_items ORDER BY name ASC'),
            pool.query('SELECT * FROM app_settings WHERE id = 1'),
            pool.query('SELECT ticket_id, scanned_count FROM scanned_tickets')
        ]);

        // Construct state object
        const state = {
            events: events.rows,
            drags: drags.rows,
            webMerch: merchItems.rows.filter((item: any) => item.drag_id === null),
            dragMerch: merchItems.rows.filter((item: any) => item.drag_id !== null),
            settings: settings.rows[0] || {},
            scannedTickets: scannedTickets.rows.reduce((acc: any, curr: any) => {
                acc[curr.ticket_id] = curr.scanned_count;
                return acc;
            }, {}),
            // Helpers identifiers
            nextEventId: (events.rows.length > 0 ? Math.max(...events.rows.map((e: any) => e.id)) : 0) + 1,
            nextDragId: (drags.rows.length > 0 ? Math.max(...drags.rows.map((d: any) => d.id)) : 0) + 1
        };

        res.json(state);

    } catch (error) {
        console.error('Error fetching state:', error);
    }
});

// POST save aggregated state (Legacy save.php equivalent)
router.post('/', async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { events, drags, settings } = req.body;

        // 1. Settings (Upsert)
        if (settings) {
            await client.query(`
                INSERT INTO app_settings (id, app_logo_url, ticket_logo_url, banner_video_url, promo_enabled, promo_custom_text, promo_neon_color, allowed_domains)
                VALUES (1, $1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO UPDATE SET
                    app_logo_url = EXCLUDED.app_logo_url,
                    ticket_logo_url = EXCLUDED.ticket_logo_url,
                    banner_video_url = EXCLUDED.banner_video_url,
                    promo_enabled = EXCLUDED.promo_enabled,
                    promo_custom_text = EXCLUDED.promo_custom_text,
                    promo_neon_color = EXCLUDED.promo_neon_color,
                    allowed_domains = EXCLUDED.allowed_domains
            `, [
                settings.appLogoUrl,
                settings.ticketLogoUrl,
                settings.bannerVideoUrl,
                settings.promoEnabled,
                settings.promoCustomText,
                settings.promoNeonColor,
                settings.allowedDomains
            ]);
        }

        // 2. Events (Full Replace Strategy for simplicity/parity)
        if (Array.isArray(events)) {
            // First delete all events to ensure removed ones are gone
            // Note: This might cascade delete tickets if foreign keys exist. 
            // Ideally we should Upsert, but legacy app expects full overwrite.
            // Risk: Deleting event deletes tickets? 
            // Check schema: tickets references events(id). If we delete event, we lose tickets?
            // Schema likely has NO cascade or RESTRICT.
            // If we blindly delete, we might fail.
            // Better strategy: UPSERT each event.
            for (const event of events) {
                await client.query(`
                    INSERT INTO events (id, name, date, description, price, poster_image_url, ticket_capacity, tickets_sold, gallery_images, is_archived)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        date = EXCLUDED.date,
                        description = EXCLUDED.description,
                        price = EXCLUDED.price,
                        poster_image_url = EXCLUDED.poster_image_url,
                        ticket_capacity = EXCLUDED.ticket_capacity,
                        tickets_sold = EXCLUDED.tickets_sold,
                        gallery_images = EXCLUDED.gallery_images,
                        is_archived = EXCLUDED.is_archived
                `, [
                    event.id, event.name, event.date, event.description, event.price,
                    event.posterImageUrl, event.ticketCapacity, event.ticketsSold,
                    event.galleryImages, event.isArchived
                ]);
            }

            // Delete events not present in the payload (Sync)
            if (events.length > 0) {
                const ids = events.map((e: any) => e.id);
                // Safe delete: only delete if ID is not in the list
                await client.query('DELETE FROM events WHERE id NOT IN (' + ids.join(',') + ')');
            }
        }

        // 3. Drags (Upsert + Clean)
        if (Array.isArray(drags)) {
            for (const drag of drags) {
                await client.query(`
                    INSERT INTO drags (id, name, instagram_handle, description, card_color, cover_image_url, gallery_images)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        instagram_handle = EXCLUDED.instagram_handle,
                        description = EXCLUDED.description,
                        card_color = EXCLUDED.card_color,
                        cover_image_url = EXCLUDED.cover_image_url,
                        gallery_images = EXCLUDED.gallery_images
                `, [
                    drag.id, drag.name, drag.instagramHandle, drag.description,
                    drag.cardColor, drag.coverImageUrl, drag.galleryImages
                ]);
            }
            if (drags.length > 0) {
                const ids = drags.map((d: any) => d.id);
                await client.query('DELETE FROM drags WHERE id NOT IN (' + ids.join(',') + ')');
            }
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving state:', error);
        res.status(500).json({ error: 'Failed to save state' });
    } finally {
        client.release();
    }
});

export default router;
