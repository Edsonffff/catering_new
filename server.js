const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'edson@123', // add your MySQL password if any
  database: 'catering_db'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('MySQL Connected');
});

// 🔐 Login API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.promise().query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    'secret123',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// 🚀 Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
