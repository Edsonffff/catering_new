const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

/* -------------------- SECURITY -------------------- */

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Rate limiter (API only)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    'https://catering-new-5.onrender.com',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- HEALTH CHECKS -------------------- */
// Root health check (IMPORTANT for Render)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

/* -------------------- STATIC FILES -------------------- */
// Render-safe static path
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

/* -------------------- ROUTES -------------------- */
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const packageRoutes = require('./routes/packages');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const galleryRoutes = require('./routes/gallery');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gallery', galleryRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

