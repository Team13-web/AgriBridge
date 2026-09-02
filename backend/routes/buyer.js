import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `
      SELECT p.*, u.full_name AS farmer_name
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      WHERE p.status = 'available'
    `;
    const params = [];

    if (category) {
      sql += ` AND p.category = ?`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (p.product_name LIKE ? OR p.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.created_at DESC`;
    const products = await query(sql, params);
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const products = await query(
      `SELECT p.*, u.full_name AS farmer_name, u.phone AS farmer_phone
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.json({ success: true, data: products[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cart
router.get('/cart', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    const items = await query(
      `SELECT c.id AS cart_id, c.quantity, p.*
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart
router.post('/cart', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    await query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity || 1]
    );
    return res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cart/:id
router.put('/cart/:id', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    const { quantity } = req.body;
    await query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:id
router.delete('/cart/:id', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    await query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders
router.post('/orders', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    const { items, total_amount, shipping_address, payment_method } = req.body;

    const grand_total = Number(total_amount) + 150 + 50;

    const result = await query(
      `INSERT INTO orders (buyer_id, total_amount, delivery_fee, platform_fee, grand_total, shipping_address, payment_method, payment_status, order_status)
       VALUES (?, ?, 150.00, 50.00, ?, ?, ?, 'successful', 'processing')`,
      [req.user.id, total_amount, grand_total, shipping_address, payment_method || 'UPI']
    );

    const orderId = result.insertId;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price_per_unit, item.quantity * item.price_per_unit]
        );
      }
    }

    // Clear Cart
    await query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    const txId = `AGRI${Date.now()}`;
    await query(
      `INSERT INTO transactions (transaction_id, user_id, type, amount, payment_method, status, reference_id, description)
       VALUES (?, ?, 'order_payment', ?, ?, 'successful', ?, 'Marketplace produce order')`,
      [txId, req.user.id, grand_total, payment_method || 'UPI', `ORD-${orderId}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order_id: orderId, transaction_id: txId, grand_total }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders
router.get('/orders', authenticateToken, authorizeRoles('buyer'), async (req, res) => {
  try {
    const orders = await query(
      'SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
