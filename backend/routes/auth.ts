import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../database/db';

const router = express.Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        console.log('🔑 Login attempt:', { username, hasPassword: !!password });

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password required' });
            return;
        }

        // Query admin user
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            console.log('❌ User not found');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            console.log('❌ Invalid password');
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Set session
        if (req.session) {
            req.session.isLoggedIn = true;
            req.session.isAdmin = true;
            req.session.username = user.username;

            // CRITICAL: Explicitly save session to ensure it persists
            req.session.save((err) => {
                if (err) {
                    console.error('❌ Session save error:', err);
                    res.status(500).json({ error: 'Session error' });
                    return;
                }
                console.log('✅ Login success, session saved:', req.sessionID);
                res.json({
                    success: true,
                    username: user.username
                });
            });
        } else {
            console.error('❌ Session not available');
            res.status(500).json({ error: 'Session not available' });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).json({ error: 'Logout failed' });
                return;
            }
            res.json({ success: true });
        });
    } else {
        res.json({ success: true });
    }
});

// Check auth status
router.get('/status', (req: Request, res: Response) => {
    res.json({
        isLoggedIn: req.session?.isLoggedIn || false,
        isAdmin: req.session?.isAdmin || false,
        username: req.session?.username || null
    });
});

export default router;
