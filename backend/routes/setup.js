const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const router = express.Router();

router.get('/check-env', async (req, res) => {
    const envPath = path.join(__dirname, '../.env');

    if (!fs.existsSync(envPath)) {
        return res.json({ exists: false, connected: false });
    }

    try {
        require('dotenv').config({ path: envPath });
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await connection.end();
        res.json({ exists: true, connected: true });
    } catch (error) {
        res.json({ exists: true, connected: false });
    }
});

router.post('/test-connection', async (req, res) => {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT } = req.body;

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });

        await connection.end();

        const envContent = `DB_HOST=${DB_HOST}\nDB_USER=${DB_USER}\nDB_PASSWORD='${DB_PASSWORD}'\nDB_NAME=${DB_NAME}\nPORT=${PORT}`;
        const envPath = path.join(__dirname, '../.env');
        fs.writeFileSync(envPath, envContent);

        // Reload environment variables
        delete require.cache[require.resolve('dotenv')];
        require('dotenv').config();

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});



module.exports = router;
