import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/lands (Public search / list with filter & pagination)
router.get('/', async (req, res) => {
  try {
    const { location, soil_type, min_acres, max_price, search } = req.query;
    let sql = `
      SELECT l.*, u.full_name AS owner_name, u.phone AS owner_phone
      FROM lands l
      JOIN users u ON l.owner_id = u.id
      WHERE l.status = 'approved'
    `;
    const params = [];

    if (location) {
      sql += ` AND l.location LIKE ?`;
      params.push(`%${location}%`);
    }
    if (soil_type) {
      sql += ` AND l.soil_type LIKE ?`;
      params.push(`%${soil_type}%`);
    }
    if (min_acres) {
      sql += ` AND l.acres >= ?`;
      params.push(Number(min_acres));
    }
    if (max_price) {
      sql += ` AND l.lease_price <= ?`;
      params.push(Number(max_price));
    }
    if (search) {
      sql += ` AND (l.land_name LIKE ? OR l.location LIKE ? OR l.suitable_crops LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const lands = await query(sql, params);
    return res.json({ success: true, data: lands });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/lands/:id
router.get('/:id', async (req, res) => {
  try {
    const lands = await query(
      `SELECT l.*, u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
       FROM lands l
       JOIN users u ON l.owner_id = u.id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (lands.length === 0) {
      return res.status(404).json({ success: false, message: 'Land listing not found' });
    }

    const images = await query('SELECT image_url, is_primary FROM land_images WHERE land_id = ?', [req.params.id]);
    
    const landData = {
      ...lands[0],
      images: images.length > 0 ? images.map(img => img.image_url) : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800']
    };

    return res.json({ success: true, data: landData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/landowners/:id/lands
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const lands = await query('SELECT * FROM lands WHERE owner_id = ? ORDER BY created_at DESC', [req.params.ownerId]);
    return res.json({ success: true, data: lands });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/lands (Landowner only)
router.post('/', authenticateToken, authorizeRoles('landowner', 'admin'), async (req, res) => {
  try {
    const {
      land_name,
      location,
      district,
      state,
      acres,
      soil_type,
      water_source,
      electricity,
      road_access,
      suitable_crops,
      lease_price,
      lease_duration_months,
      description,
      image_url
    } = req.body;

    const result = await query(
      `INSERT INTO lands 
       (owner_id, land_name, location, district, state, acres, soil_type, water_source, electricity, road_access, suitable_crops, lease_price, lease_duration_months, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [
        req.user.id,
        land_name,
        location,
        district || location,
        state || 'Andhra Pradesh',
        acres,
        soil_type,
        water_source,
        electricity || 'yes',
        road_access || 'yes',
        suitable_crops,
        lease_price,
        lease_duration_months || 12,
        description
      ]
    );

    const landId = result.insertId;

    if (image_url) {
      await query('INSERT INTO land_images (land_id, image_url, is_primary) VALUES (?, ?, TRUE)', [landId, image_url]);
    }

    return res.status(201).json({ success: true, message: 'Land published successfully', data: { id: landId } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/lands/:id
router.put('/:id', authenticateToken, authorizeRoles('landowner', 'admin'), async (req, res) => {
  try {
    const { land_name, location, acres, soil_type, lease_price, description } = req.body;

    await query(
      `UPDATE lands
       SET land_name = ?, location = ?, acres = ?, soil_type = ?, lease_price = ?, description = ?
       WHERE id = ? AND owner_id = ?`,
      [land_name, location, acres, soil_type, lease_price, description, req.params.id, req.user.id]
    );

    return res.json({ success: true, message: 'Land listing updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/lands/:id
router.delete('/:id', authenticateToken, authorizeRoles('landowner', 'admin'), async (req, res) => {
  try {
    await query('DELETE FROM lands WHERE id = ? AND owner_id = ?', [req.params.id, req.user.id]);
    return res.json({ success: true, message: 'Land listing deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
