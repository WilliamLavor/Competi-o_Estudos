const express = require('express');
const database = require('better-sqlite3');

const db = new database('sessions.db');

const app = express();
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);


app.get('/api/sessions', (req, res) => {
    const rows = db
    .prepare('SELECT * FROM sessions ORDER BY created_at DESC, id DESC')
    .all();
    res.json(rows);
});

app.post('/api/sessions', (req, res) => {
    const { subject, duration_minutes, notes } = req.body;
    if (!subject || !Number.isInteger(duration_minutes) || duration_minutes <= 0) {
        return res.status(400).json({ error: 'Subject and duration_minutes are required' });
    }


    const result = db
    .prepare('INSERT INTO sessions (subject, duration_minutes, notes) VALUES (?, ?, ?)')
    .run(subject, duration_minutes, notes ?? null);

    const created = db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(result.lastInsertRowid);

    res.status(201).json(created);
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

