import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = await initDB();

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Create user (for demo; in prod protect this endpoint)
app.post('/api/users', async (req, res) => {
  const { name, role, nfc_tag, password_hash } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, role, nfc_tag, password_hash) VALUES (?, ?, ?, ?)',
      [name, role || 'employee', nfc_tag || null, password_hash || null]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Start stamp: creates a new work_session with start_time = NOW()
app.post('/api/start', async (req, res) => {
  try {
    const { userId, tag } = req.body;
    let uId = userId;
    // If tag provided, map to userId
    if (!uId && tag) {
      const [rows] = await pool.query('SELECT id FROM users WHERE nfc_tag = ? LIMIT 1', [tag]);
      if (!rows.length) return res.status(404).json({ error: 'Tag not registered' });
      uId = rows[0].id;
    }
    if (!uId) return res.status(400).json({ error: 'userId or tag required' });

    await pool.query('INSERT INTO work_sessions (user_id, start_time) VALUES (?, NOW())', [uId]);
    res.json({ message: 'Arbeitsbeginn erfasst', userId: uId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Stop stamp: sets end_time for last open session
app.post('/api/stop', async (req, res) => {
  try {
    const { userId, tag } = req.body;
    let uId = userId;
    if (!uId && tag) {
      const [rows] = await pool.query('SELECT id FROM users WHERE nfc_tag = ? LIMIT 1', [tag]);
      if (!rows.length) return res.status(404).json({ error: 'Tag not registered' });
      uId = rows[0].id;
    }
    if (!uId) return res.status(400).json({ error: 'userId or tag required' });

    const [result] = await pool.query(
      'UPDATE work_sessions SET end_time = NOW() WHERE user_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1',
      [uId]
    );
    res.json({ message: 'Arbeitsende erfasst', affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Get sessions for a user
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM work_sessions WHERE user_id = ? ORDER BY start_time DESC', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Admin: list users with last session
app.get('/api/admin/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.role, u.nfc_tag,
        (SELECT start_time FROM work_sessions ws WHERE ws.user_id = u.id ORDER BY ws.start_time DESC LIMIT 1) AS last_start,
        (SELECT end_time FROM work_sessions ws WHERE ws.user_id = u.id ORDER BY ws.start_time DESC LIMIT 1) AS last_end
      FROM users u
      ORDER BY u.name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Backend läuft auf http://localhost:' + PORT));
