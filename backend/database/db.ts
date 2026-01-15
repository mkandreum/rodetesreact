import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Debug logging to help diagnosis
console.log(`[DB] Initialize. DATABASE_URL present: ${!!connectionString}`);
if (!connectionString) {
    console.log('[DB] Fallback: Checking individual DB variables...');
    console.log(`[DB] DB_USER=${process.env.DB_USER || process.env.POSTGRES_USER || 'waiting'}`);
    console.log(`[DB] DB_HOST=${process.env.DB_HOST || 'db'}`);
    console.log(`[DB] DB_NAME=${process.env.DB_NAME || process.env.POSTGRES_DB || 'waiting'}`);
}

// Database connection pool configuration
const poolConfig: any = {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

if (connectionString) {
    poolConfig.connectionString = connectionString;
} else {
    // Fallback to explicit components
    poolConfig.user = process.env.DB_USER || process.env.POSTGRES_USER || 'rodetes';
    poolConfig.password = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'partysecure';
    poolConfig.host = process.env.DB_HOST || 'db';
    poolConfig.database = process.env.DB_NAME || process.env.POSTGRES_DB || 'rodetesdb';
    poolConfig.port = 5432;
}

import { SCHEMA_SQL } from './schema';

// ... (previous code)

const pool = new Pool(poolConfig);

// Initialize Database Function
export async function initDb() {
    try {
        console.log('[DB] Verifying database schema...');
        const client = await pool.connect();
        try {
            // Always run schema to ensure all tables exist (Idempotent: uses IF NOT EXISTS)
            await client.query(SCHEMA_SQL);
            console.log('[DB] ✓ Database schema verified');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[DB] Initialization failed:', err);
        // Do not exit process, let retry logic handle it or fail gracefully later
        // Throwing here allows server.ts to decide whether to crash
        throw err;
    }
}

// Test connection on startup
pool.on('connect', () => {
    // console.log('✓ Database connected successfully');
});

pool.on('error', (err: Error) => {
    console.error('Unexpected database error:', err);
    // don't exit, might be transient
});

export default pool;
