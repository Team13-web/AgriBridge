import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/landowner/dashboard
router.get('/dashboard', authenticateToken, authorizeRoles('landowner'), async (req, res) => {
  try {
    const ownerId = req.user.id;

    const totalLands = await query('SELECT COUNT(*) AS total FROM lands WHERE owner_id = ?', [ownerId]);
    const activeLeases = await query('SELECT COUNT(*) AS active FROM leases WHERE owner_id = ? AND status = "active"', [ownerId]);
    const applications = await query(
      `SELECT COUNT(app.id) AS total_apps
       FROM lease_applications app
       JOIN lands l ON app.land_id = l.id
       WHERE l.owner_id = ? AND app.status = 'pending'`,
      [ownerId]
    );
    const earnings = await query('SELECT COALESCE(SUM(annual_price), 0) AS total FROM leases WHERE owner_id = ? AND payment_status = "paid"', [ownerId]);

    const recentApps = await query(
      `SELECT app.*, l.land_name, u.full_name AS farmer_name
       FROM lease_applications app
       JOIN lands l ON app.land_id = l.id
       JOIN users u ON app.farmer_id = u.id
       WHERE l.owner_id = ?
       ORDER BY app.created_at DESC LIMIT 5`,
      [ownerId]
    );

    return res.json({
      success: true,
      data: {
        total_lands: totalLands[0].total,
        active_leases: activeLeases[0].active,
        pending_applications: applications[0].total_apps,
        total_earnings: earnings[0].total,
        recent_applications: recentApps
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/landowner/applications
router.get('/applications', authenticateToken, authorizeRoles('landowner'), async (req, res) => {
  try {
    const apps = await query(
      `SELECT app.*, l.land_name, l.location, u.full_name AS farmer_name, u.email AS farmer_email, u.phone AS farmer_phone
       FROM lease_applications app
       JOIN lands l ON app.land_id = l.id
       JOIN users u ON app.farmer_id = u.id
       WHERE l.owner_id = ?
       ORDER BY app.created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: apps });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/landowner/applications/:id/status
router.put('/applications/:id/status', authenticateToken, authorizeRoles('landowner'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    await query('UPDATE lease_applications SET status = ? WHERE id = ?', [status, req.params.id]);

    if (status === 'approved') {
      const app = await query('SELECT * FROM lease_applications WHERE id = ?', [req.params.id]);
      if (app.length > 0) {
        const item = app[0];
        const land = await query('SELECT owner_id, lease_price FROM lands WHERE id = ?', [item.land_id]);
        
        await query(
          `INSERT INTO leases (application_id, land_id, farmer_id, owner_id, start_date, end_date, annual_price, payment_status, status)
           VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), ?, 'pending', 'active')`,
          [item.id, item.land_id, item.farmer_id, land[0].owner_id, item.proposed_price || land[0].lease_price]
        );
      }
    }

    return res.json({ success: true, message: `Application ${status} successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/landowner/earnings
router.get('/earnings', authenticateToken, authorizeRoles('landowner'), async (req, res) => {
  try {
    const earnings = await query(
      `SELECT les.*, l.land_name, u.full_name AS farmer_name
       FROM leases les
       JOIN lands l ON les.land_id = l.id
       JOIN users u ON les.farmer_id = u.id
       WHERE les.owner_id = ? AND les.payment_status = 'paid'`,
      [req.user.id]
    );
    return res.json({ success: true, data: earnings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
