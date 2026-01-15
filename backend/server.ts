import express, { Request, Response } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

const PgSession = connectPgSimple(session);

// Routes
import authRoutes from './routes/auth';
import stateRoutes from './routes/state';
import ticketRoutes from './routes/tickets';
import merchRoutes from './routes/merch';
import uploadRoutes from './routes/upload';
import backupRoutes from './routes/backup';

// Database
import pool, { initDb } from './database/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Middleware
// ============================================

// Trust proxy (required for secure cookies behind Nginx/Load Balancer)
app.set('trust proxy', 1);

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session management
app.use(session({
    store: new PgSession({
        pool: pool,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// ============================================
// Routes
// ============================================

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/merch', merchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/backup', backupRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'API Route not found' });
});

// Serve React App (SPA)
// In production, frontend build is copied to 'public' folder relative to this file
app.use(express.static(path.join(__dirname, 'public')));

// Handle React Routing, return all other requests to React app
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Start Server
// ============================================

// Initialize DB then start server
let server: any;

initDb().then(() => {
    server = app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ Accessible at http://0.0.0.0:${PORT}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    if (server) {
        server.close(() => {
            pool.end().then(() => {
                console.log('Database pool closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
});

export default app;
