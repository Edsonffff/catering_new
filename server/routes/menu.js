const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all menu categories with items
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM menu_categories WHERE is_active = true ORDER BY display_order'
    );

    for (let category of categories) {
      const [items] = await db.query(
        'SELECT * FROM menu_items WHERE category_id = ? AND is_available = true ORDER BY display_order',
        [category.id]
      );
      category.items = items;
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all menu items
router.get('/items', async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT mi.*, mc.name as category_name 
       FROM menu_items mi 
       JOIN menu_categories mc ON mi.category_id = mc.id 
       WHERE mi.is_available = true 
       ORDER BY mc.display_order, mi.display_order`
    );

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Create menu category
router.post('/categories', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description, display_order } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO menu_categories (name, description, image_url, display_order) VALUES (?, ?, ?, ?)',
      [name, description, image_url, display_order || 0]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Update menu category
router.put('/categories/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, is_active } = req.body;
    
    let updateQuery = 'UPDATE menu_categories SET name = ?, description = ?, display_order = ?, is_active = ?';
    let params = [name, description, display_order || 0, is_active !== undefined ? is_active : true];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Delete menu category
router.delete('/categories/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM menu_categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Create menu item
router.post('/items', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, description, price, display_order } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO menu_items (category_id, name, description, price, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name, description, price, image_url, display_order || 0]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Update menu item
router.put('/items/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, display_order, is_available } = req.body;
    
    let updateQuery = 'UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, display_order = ?, is_available = ?';
    let params = [category_id, name, description, price, display_order || 0, is_available !== undefined ? is_available : true];

    if (req.file) {
      updateQuery += ', image_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin: Delete menu item
router.delete('/items/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
