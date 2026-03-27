require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rate limit
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

// DB
let db;

async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    });

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ DB Connected');
  } catch (err) {
    console.log('❌ DB Error:', err.message);
  }
}
connectDB();

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok 🚀' });
});

// Contact API
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Running on http://localhost:${PORT}`);
});