// Quick script to hash admin password
const bcrypt = require('bcryptjs');

const password = process.env.VITE_ADMIN_PASS || 'rodetes';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nSQL to update admin_users:');
console.log(`INSERT INTO admin_users (username, password_hash) VALUES ('admin', '${hash}') ON CONFLICT (username) DO UPDATE SET password_hash = '${hash}';`);
