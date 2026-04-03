require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend running');
});

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Test database connection
    try {
        const connection = await db.getConnection();
        console.log('Successfully connected to the database.');
        connection.release();
    } catch (err) {
        console.error('Failed to connect to the database:', err.message);
    }
});
