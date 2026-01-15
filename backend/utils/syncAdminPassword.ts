import bcrypt from 'bcryptjs';
import pool from '../database/db';

/**
 * Sync admin user password with environment variable
 * This ensures the admin password in DB matches VITE_ADMIN_PASS
 */
export async function syncAdminPassword() {
    try {
        const adminUser = process.env.VITE_ADMIN_USER || 'admin';
        const adminPass = process.env.VITE_ADMIN_PASS || 'rodetes';

        console.log('🔑 Syncing admin password from environment...');

        // Check if admin exists
        const result = await pool.query(
            'SELECT * FROM admin_users WHERE username = $1',
            [adminUser]
        );

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(adminPass, salt);

        if (result.rows.length === 0) {
            // Create admin
            await pool.query(
                'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
                [adminUser, hash]
            );
            console.log(`✅ Admin user '${adminUser}' created`);
        } else {
            // Update password hash (in case env var changed)
            await pool.query(
                'UPDATE admin_users SET password_hash = $1 WHERE username = $2',
                [hash, adminUser]
            );
            console.log(`✅ Admin user '${adminUser}' password synced`);
        }

    } catch (error) {
        console.error('❌ Error syncing admin password:', error);
        throw error;
    }
}
