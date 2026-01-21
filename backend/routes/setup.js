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
    let { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT, DB_PORT } = req.body;

    // Default DB_PORT to 3306 if not provided or empty
    if (!DB_PORT) DB_PORT = '3306';
    // Default DB_HOST to localhost if not provided or empty
    if (!DB_HOST) DB_HOST = 'localhost';
    
    // Default DB_NAME/USER if completely missing (safety net)
    if (!DB_USER) DB_USER = 'root';
    if (!DB_NAME) DB_NAME = 'reox_pos';

    try {
        const connectionConfig = {
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            port: parseInt(DB_PORT)
        };
        
        // Only add database if name is provided, to allow connection test to succeed even if DB doesn't exist yet (Prisma will create it)
        if (DB_NAME) {
            // Check if we can connect without DB first to distinguish auth vs db missing errors? 
            // Simplified: Try connecting with DB name. If it fails with 'Unknown database', we can proceed assuming Prisma creates it.
            // For now, let's stick to the user's flow. If they provide a name, we try to use it. 
            // Actually, for setup, we often want to create the DB. 
            // Let's rely on Prisma to create the DB. We just test credentials here.
            // connectionConfig.database = DB_NAME; // Commented out to allow DB creation by Prisma
        }

        // Test connection (without selecting DB to ensure credentials work even if DB missing)
        const connection = await mysql.createConnection(connectionConfig);
        await connection.end();

        // Construct DATABASE_URL for Prisma
        const encodedPassword = encodeURIComponent(DB_PASSWORD);
        const databaseUrl = `mysql://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

        // Ensure PORT defaults to 5000 if missing for .env file
        const APP_PORT = PORT || '5000';

        const envContent = `DB_HOST=${DB_HOST}\nDB_USER=${DB_USER}\nDB_PASSWORD='${DB_PASSWORD}'\nDB_NAME=${DB_NAME}\nPORT=${APP_PORT}\nDATABASE_URL="${databaseUrl}"`;
        const envPath = path.join(__dirname, '../.env');
        fs.writeFileSync(envPath, envContent);

        // Reload environment variables in current process
        delete require.cache[require.resolve('dotenv')];
        require('dotenv').config();

        // Run Prisma DB Push and Seed
        const { exec } = require('child_process');
        const projectRoot = path.join(__dirname, '..');

        // Command to run prisma db push and then seed
        const command = `npx prisma db push --accept-data-loss && node prisma/seed.js`;

        console.log(`Executing command: ${command} in ${projectRoot}`);
        console.log(`Using DATABASE_URL: ${databaseUrl}`);

        exec(command, { 
            cwd: projectRoot,
            // Explicitly pass the DATABASE_URL to ensure the child process uses the correct one immediately
            env: { ...process.env, DATABASE_URL: databaseUrl } 
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Exec error: ${error}`);
                console.error(`Stderr: ${stderr}`);
                return res.json({ success: false, message: `Database setup failed during table generation/seeding. Check server logs. Error: ${error.message}` });
            }
            console.log(`Stdout: ${stdout}`);
            if (stderr) console.warn(`Stderr (warning): ${stderr}`);

            res.json({ success: true, message: 'Database configured, tables created, and seeded successfully! Please manually restart the server if the application does not reconnect automatically.' });
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});



module.exports = router;
