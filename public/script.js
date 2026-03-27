// ═══════════════════════════════════════════════════════
//   DHANUSH S — PORTFOLIO  |  server.js
//   Node.js + Express + TiDB Cloud (MySQL)
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files (index.html, style.css, script.js)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── RATE LIMITING ─────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, error: 'Too many requests. Please try again later.' }
});

// ── DATABASE CONNECTION (TiDB Cloud / MySQL) ──────────
let db;

async function createDBConnection() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'portfolio_db',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Connected to TiDB Cloud successfully');
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    // Don't crash server; will retry on next request
  }
}

createDBConnection();

// ── CORS HEADERS ───────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── ROUTES ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dhanush S Portfolio API is running 🚀' });
});

// POST /api/contact — Save message to TiDB
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (name.length > 100 || email.length > 150 || message.length > 2000) {
    return res.status(400).json({ success: false, error: 'Input too long.' });
  }

  try {
    if (!db) throw new Error('Database not connected');
    const [result] = await db.execute(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), message.trim()]
    );
    console.log(`📨 New message from ${name} <${email}> (ID: ${result.insertId})`);
    res.json({ success: true, message: 'Message received! I\'ll get back to you soon.' });
  } catch (err) {
    console.error('DB insert error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save message. Please try again.' });
  }
});

// GET /api/messages — View all messages (protected, dev only)
app.get('/api/messages', async (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── FALLBACK SPA ROUTE ─────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running at http://localhost:${PORT}`);
  console.log(`📊 API health: http://localhost:${PORT}/api/health\n`);
});