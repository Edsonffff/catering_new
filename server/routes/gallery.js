const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all active gallery images
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM gallery WHERE is_active = true';
    let params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY display_order, created_at DESC';

    const [images] = await db.query(query, params);

    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Get all gallery images
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const [images] = await db.query('SELECT * FROM gallery ORDER BY display_order, created_at DESC');
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Upload image
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const { title, description, category, display_order } = req.body;
    const image_url = `/uploads/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO gallery (title, description, image_url, category, display_order) VALUES (?, ?, ?, ?, ?)',
      [title || null, description || null, image_url, category || null, display_order || 0]
    );

    res.status(201).json({ success: true, data: { id: result.insertId, image_url } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Update image
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, display_order, is_active } = req.body;

    await db.query(
      'UPDATE gallery SET title = ?, description = ?, category = ?, display_order = ?, is_active = ? WHERE id = ?',
      [title || null, description || null, category || null, display_order || 0, is_active !== undefined ? is_active : true, id]
    );

    res.json({ success: true, message: 'Image updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Delete image
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
