const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reox_pos',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Test connection only if config looks vaguely valid (e.g. user is present), otherwise skipping to allow setup
if (process.env.DB_USER) {
    promisePool.query('SELECT 1')
        .then(() => console.log('Database connected successfully'))
        .catch(err => {
            console.warn('Database connection failed (this is expected during initial setup):', err.message);
        });
} else {
    console.log('Database configuration missing. Waiting for setup...');
}

module.exports = promisePool;
