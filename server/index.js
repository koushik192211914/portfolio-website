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
app.post('/api/tasks', async (req, res) => {
    const { title, assigned_to, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO tasks (title, assigned_to, status) VALUES (?, ?, ?)',
            [title, assigned_to || null, status || 'pending']
        );
        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertId,
            task: {
                id: result.insertId,
                title,
                assigned_to: assigned_to || null,
                status: status || 'pending'
            }
        });
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET endpoint to fetch all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE endpoint to remove a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT endpoint to toggle task completion status
app.put('/api/tasks/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT status FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });

        const newStatus = rows[0].status === 'done' ? 'pending' : 'done';
        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, id]);

        res.json({ message: 'Task status updated', status: newStatus });
    } catch (error) {
        console.error('Error toggling task:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
