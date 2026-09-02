import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/farmer/dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const farmerId = req.user.id;

    const leases = await query('SELECT COUNT(*) AS total_leases FROM leases WHERE farmer_id = ? AND status = "active"', [farmerId]);
    const pendingApps = await query('SELECT COUNT(*) AS pending FROM lease_applications WHERE farmer_id = ? AND status = "pending"', [farmerId]);
    const approvedApps = await query('SELECT COUNT(*) AS approved FROM lease_applications WHERE farmer_id = ? AND status = "approved"', [farmerId]);
    const spending = await query('SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE payer_id = ? AND status = "successful"', [farmerId]);
    const recentTx = await query('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [farmerId]);

    return res.json({
      success: true,
      data: {
        total_leases: leases[0].total_leases,
        pending_applications: pendingApps[0].pending,
        approved_applications: approvedApps[0].approved,
        total_spending: spending[0].total,
        recent_transactions: recentTx
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/farmer/leases
router.get('/leases', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const leases = await query(
      `SELECT les.*, l.land_name, l.location, l.acres, u.full_name AS owner_name, u.phone AS owner_phone
       FROM leases les
       JOIN lands l ON les.land_id = l.id
       JOIN users u ON les.owner_id = u.id
       WHERE les.farmer_id = ?
       ORDER BY les.created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: leases });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leases/apply
router.post('/leases/apply', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const { land_id, proposed_duration_months, proposed_price, message } = req.body;

    const result = await query(
      `INSERT INTO lease_applications (land_id, farmer_id, proposed_duration_months, proposed_price, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [land_id, req.user.id, proposed_duration_months || 12, proposed_price, message]
    );

    return res.status(201).json({
      success: true,
      message: 'Lease application submitted successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/farmer/applications
router.get('/applications', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const apps = await query(
      `SELECT app.*, l.land_name, l.location, l.lease_price, u.full_name AS owner_name
       FROM lease_applications app
       JOIN lands l ON app.land_id = l.id
       JOIN users u ON l.owner_id = u.id
       WHERE app.farmer_id = ?
       ORDER BY app.created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: apps });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/farmer/payment
router.post('/payment', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const { lease_id, amount, payment_method } = req.body;
    const txId = `AGRI${Date.now()}`;

    // Record Payment
    await query(
      `INSERT INTO payments (reference_type, reference_id, payer_id, amount, payment_method, status, transaction_id)
       VALUES ('lease', ?, ?, ?, ?, 'successful', ?)`,
      [lease_id, req.user.id, amount, payment_method, txId]
    );

    // Record Transaction
    await query(
      `INSERT INTO transactions (transaction_id, user_id, type, amount, payment_method, status, reference_id, description)
       VALUES (?, ?, 'lease_payment', ?, ?, 'successful', ?, 'Lease fee payment')`,
      [txId, req.user.id, amount, payment_method, `LEASE-${lease_id}`]
    );

    // Update Lease Status
    await query('UPDATE leases SET payment_status = "paid" WHERE id = ?', [lease_id]);

    return res.json({
      success: true,
      message: 'Payment completed successfully',
      data: { transaction_id: txId, amount, status: 'successful' }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/farmer/transactions
router.get('/transactions', authenticateToken, authorizeRoles('farmer'), async (req, res) => {
  try {
    const txs = await query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ success: true, data: txs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
