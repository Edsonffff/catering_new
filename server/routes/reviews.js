const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');

// Get approved reviews
router.get('/', async (req, res) => {
  try {
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE is_approved = true ORDER BY created_at DESC'
    );

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Submit new review
router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, comment, event_type } = req.body;

    if (!customer_name || !rating) {
      return res.status(400).json({ success: false, message: 'Name and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    await db.query(
      'INSERT INTO reviews (customer_name, rating, comment, event_type) VALUES (?, ?, ?, ?)',
      [customer_name, rating, comment || null, event_type || null]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully! It will be visible after approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Get all reviews
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const [reviews] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Approve/Reject review
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { is_approved } = req.body;
    await db.query('UPDATE reviews SET is_approved = ? WHERE id = ?', [is_approved, req.params.id]);
    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Delete review
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
