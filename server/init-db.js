const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schema);
        console.log('Database and tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        console.log('\nTIP: Make sure your DB_USER and DB_PASSWORD are correct in .env');
    } finally {
        await connection.end();
    }
}

initDB();
