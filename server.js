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
const PORT = process.env.PORT || 4000;

// ── MIDDLEWARE ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ── RATE LIMIT (avoid spam) ────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { success: false, error: 'Too many requests. Try later.' }
});

// ── DATABASE CONNECTION ────────────────────────────────
let db;

async function connectDB() {
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
      connectionLimit: 10
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

    console.log('✅ Connected to TiDB successfully');

  } catch (err) {
    console.error('❌ DB connection error:', err.message);
  }
}

connectDB();

// ── ROUTES ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running 🚀' });
});

// Save contact form
app.post('/api/contact', contactLimiter, async (req, res) => {

  console.log('📩 Incoming data:', req.body); // DEBUG

  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email'
    });
  }

  try {
    if (!db) throw new Error('DB not connected');

    const [result] = await db.execute(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    console.log(`✅ Saved message ID: ${result.insertId}`);

    res.json({
      success: true,
      message: 'Message saved successfully!'
    });

  } catch (err) {
    console.error('❌ Insert error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

// View messages (for testing)
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health\n`);
});