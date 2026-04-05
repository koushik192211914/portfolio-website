require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Authentication System
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === 'sarath' && password === '12345678') {
        return res.json({ success: true, user: { username: 'sarath', role: 'Admin' } });
    } else if ((username === 'user1' && password === 'user1') || (username === 'user2' && password === 'user2')) {
        return res.json({ success: true, user: { username, role: 'User' } });
    }

    res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// 2. Assign Task (Admin only)
app.post('/assign-task', async (req, res) => {
    const { title, description, assignedTo, priority, category, dueDate } = req.body;

    if (!title || !assignedTo) {
        return res.status(400).json({ error: 'Title and assignedTo are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO tasks (title, description, assigned_to, priority, category, due_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, assignedTo, priority || 'Medium', category || 'Work', dueDate || null, 'pending', 'Admin']
        );
        res.status(201).json({
            message: 'Task assigned successfully',
            taskId: result.insertId,
            task: { id: result.insertId, title, assignedTo, status: 'pending' }
        });
    } catch (err) {
        console.error('Error assigning task:', err.message);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});

// 3. Get User-Specific Tasks
app.get('/tasks/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM tasks WHERE assigned_to = ? OR assigned_to = "All" ORDER BY created_at DESC',
            [username]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// 4. Update Task Status
app.put('/update-task-status', async (req, res) => {
    const { id, status } = req.body;
    try {
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Task status updated' });
    } catch (err) {
        console.error('Error updating task status:', err.message);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// Helper for Admin to see all tasks
app.get('/admin/tasks', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching admin tasks:', err.message);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.listen(PORT, async () => {
    console.log(`Backend server running on port ${PORT}`);
    try {
        const connection = await db.getConnection();
        console.log('--- DATABASE CONNECTION SUCCESS ---');
        connection.release();
    } catch (err) {
        console.error('--- DATABASE CONNECTION FAILED ---');
        console.error('Error Message:', err.message);
    }
});
