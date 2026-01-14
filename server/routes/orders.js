const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, adminOnly } = require('../middleware/auth');

// Create new order
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_email,
      customer_phone,
      event_date,
      event_time,
      location,
      guest_count,
      items,
      special_requests
    } = req.body;

    // Calculate total
    let total_amount = 0;
    items.forEach(item => {
      total_amount += parseFloat(item.price) * parseInt(item.quantity);
    });

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, event_date, event_time, location, guest_count, total_amount, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_email, customer_phone, event_date, event_time, location, guest_count, total_amount, special_requests || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const subtotal = parseFloat(item.price) * parseInt(item.quantity);
      await connection.query(
        'INSERT INTO order_items (order_id, item_type, item_id, item_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.item_type, item.item_id, item.item_name, item.quantity, item.price, subtotal]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { orderId, total_amount }
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Get all orders (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    let params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND event_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND event_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const [orders] = await db.query(query, params);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single order with items
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    order.items = items;

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update order status (Admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete order (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get order statistics (Admin)
router.get('/stats/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [pendingOrders] = await db.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const [totalRevenue] = await db.query('SELECT SUM(total_amount) as revenue FROM orders WHERE status != "cancelled"');
    const [recentOrders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders[0].count,
        pendingOrders: pendingOrders[0].count,
        totalRevenue: totalRevenue[0].revenue || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
