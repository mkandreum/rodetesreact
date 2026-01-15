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

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
    console.log('✓ Database connected successfully');
});

pool.on('error', (err: Error) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

export default pool;
