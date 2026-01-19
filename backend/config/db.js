const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reox_pos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Test connection
promisePool.query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err.message));

module.exports = promisePool;
