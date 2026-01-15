import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL environment variable is not defined');
    process.exit(1);
}

// Database connection pool
const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✓ Database connected successfully');
});

pool.on('error', (err: Error) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

export default pool;
