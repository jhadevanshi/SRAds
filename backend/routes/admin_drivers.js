const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get all drivers
router.get('/', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, d.device_name, d.adsd_id 
       FROM drivers dr
       LEFT JOIN devices d ON dr.device_id = d.id
       ORDER BY dr.created_at DESC`
    );
    res.json({ success: true, drivers: result.rows });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create driver
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('vehicle_type').isIn(['Auto', 'BRTS']).withMessage('Invalid vehicle type'),
  body('vehicle_number').trim().notEmpty().withMessage('Vehicle number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, password, vehicle_type, vehicle_number, device_id } = req.body;

    const existing = await pool.query('SELECT id FROM drivers WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }

    // Check device assignment
    if (device_id) {
      const devExist = await pool.query('SELECT id FROM drivers WHERE device_id = $1', [device_id]);
      if (devExist.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Device is already assigned to another driver' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO drivers (name, phone, password_hash, vehicle_type, vehicle_number, device_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, phone`,
      [name, phone, password_hash, vehicle_type, vehicle_number, device_id || null]
    );

    res.status(201).json({ success: true, message: 'Driver created', driver: result.rows[0] });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update driver
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, phone, vehicle_type, vehicle_number, device_id, status } = req.body;

    const existing = await pool.query('SELECT id FROM drivers WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    if (device_id) {
      const devExist = await pool.query('SELECT id FROM drivers WHERE device_id = $1 AND id != $2', [device_id, req.params.id]);
      if (devExist.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Device is already assigned to another driver' });
      }
    }

    const result = await pool.query(
      `UPDATE drivers SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        vehicle_type = COALESCE($3, vehicle_type),
        vehicle_number = COALESCE($4, vehicle_number),
        device_id = $5,
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING id, name`,
      [name, phone, vehicle_type, vehicle_number, device_id || null, status, req.params.id]
    );

    res.json({ success: true, message: 'Driver updated', driver: result.rows[0] });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get earning rates
router.get('/settings/rates', adminAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM settings WHERE key IN ('earning_rate_per_km', 'earning_rate_per_hour')");
    const rates = { rate_per_km: 4, rate_per_hour: 15 };
    result.rows.forEach(r => {
      if (r.key === 'earning_rate_per_km') rates.rate_per_km = parseFloat(r.value);
      if (r.key === 'earning_rate_per_hour') rates.rate_per_hour = parseFloat(r.value);
    });
    res.json({ success: true, rates });
  } catch (error) {
    console.error('Get rates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update earning rates
router.put('/settings/rates', adminAuth, async (req, res) => {
  try {
    const { rate_per_km, rate_per_hour } = req.body;
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('earning_rate_per_km', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [String(rate_per_km)]
    );
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('earning_rate_per_hour', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [String(rate_per_hour)]
    );
    res.json({ success: true, message: 'Rates updated successfully' });
  } catch (error) {
    console.error('Update rates error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
