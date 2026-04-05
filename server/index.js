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

// POST endpoint to insert a new task
app.post('/addTask', async (req, res) => {
    const { title, assigned_to, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, assigned_to, status) VALUES (?, ?, ?)',
            [title, assigned_to, status || 'pending']
        );
        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId,
            task: { id: result.insertId, title, assigned_to, status: status || 'pending' }
        });
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).json({ error: 'Failed to create task', details: err.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err.message);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Toggle task status
app.put('/tasks/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        // First get current status
        const [rows] = await db.query('SELECT status FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });

        const newStatus = rows[0].status === 'pending' ? 'done' : 'pending';
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, id]);

        res.json({ message: 'Task status updated', status: newStatus });
    } catch (err) {
        console.error('Error toggling task:', err.message);
        res.status(500).json({ error: 'Failed to toggle task' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Test database connection with more detail
    try {
        const connection = await db.getConnection();
        console.log('--- DATABASE CONNECTION SUCCESS ---');
        console.log('Host:', process.env.DB_HOST);
        console.log('Database:', process.env.DB_NAME);
        connection.release();
    } catch (err) {
        console.error('--- DATABASE CONNECTION FAILED ---');
        console.error('Error Message:', err.message);
        console.error('Code:', err.code);
        console.error('Check your Render/Railway environment variables!');
    }
});
