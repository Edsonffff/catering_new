const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all event packages
router.get('/', async (req, res) => {
  try {
    const [packages] = await db.query(
      'SELECT * FROM event_packages WHERE is_available = true ORDER BY price'
    );

    // Parse JSON features
    packages.forEach(pkg => {
      if (pkg.features && typeof pkg.features === 'string') {
        pkg.features = JSON.parse(pkg.features);
      }
    });

    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single package
router.get('/:id', async (req, res) => {
  try {
    const [packages] = await db.query('SELECT * FROM event_packages WHERE id = ?', [req.params.id]);
    
    if (packages.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const pkg = packages[0];
    if (pkg.features && typeof pkg.features === 'string') {
      pkg.features = JSON.parse(pkg.features);
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Create package
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, min_guests, max_guests, features } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const featuresJSON = typeof features === 'string' ? features : JSON.stringify(features);

    const [result] = await db.query(
      'INSERT INTO event_packages (name, description, price, min_guests, max_guests, features, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, min_guests || 1, max_guests, featuresJSON, image_url]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Update package
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, min_guests, max_guests, features, is_available } = req.body;
    
    const featuresJSON = typeof features === 'string' ? features : JSON.stringify(features);

    let updateQuery = 'UPDATE event_packages SET name = ?, description = ?, price = ?, min_guests = ?, max_guests = ?, features = ?, is_available = ?';
    let params = [name, description, price, min_guests || 1, max_guests, featuresJSON, is_available !== undefined ? is_available : true];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ success: true, message: 'Package updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Delete package
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM event_packages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
