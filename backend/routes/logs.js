const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get admin logs
router.get('/', auth, async (req, res) => {
  try {
    const { module, action, limit } = req.query;
    let query = `
      SELECT al.*, u.name as admin_name
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (module) {
      paramCount++;
      query += ` AND al.module = $${paramCount}`;
      params.push(module);
    }

    if (action) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
    }

    query += ' ORDER BY al.created_at DESC';

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    } else {
      query += ' LIMIT 100';
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get playback logs
router.get('/playback', auth, async (req, res) => {
  try {
    const { device_id, campaign_id, ad_id, vehicle_number, area, date_from, date_to, limit = 100, offset = 0 } = req.query;
    let query = `
      SELECT 
        pl.id,
        pl.played_at,
        pl.duration,
        d.adsd_id,
        d.device_name,
        d.vehicle_type,
        d.vehicle_number,
        a.title as ad_title,
        a.ad_type,
        c.campaign_name,
        c.area
      FROM playback_logs pl
      LEFT JOIN devices d ON pl.device_id = d.id
      LEFT JOIN campaigns c ON pl.campaign_id = c.id
      LEFT JOIN ads a ON pl.ad_id = a.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (device_id) {
      paramCount++;
      query += ` AND pl.device_id = $${paramCount}`;
      params.push(device_id);
    }

    if (campaign_id) {
      paramCount++;
      query += ` AND pl.campaign_id = $${paramCount}`;
      params.push(campaign_id);
    }

    if (ad_id) {
      paramCount++;
      query += ` AND pl.ad_id = $${paramCount}`;
      params.push(ad_id);
    }

    if (vehicle_number) {
      paramCount++;
      query += ` AND d.vehicle_number ILIKE $${paramCount}`;
      params.push(`%${vehicle_number}%`);
    }

    if (area) {
      paramCount++;
      query += ` AND c.area ILIKE $${paramCount}`;
      params.push(`%${area}%`);
    }

    if (date_from) {
      paramCount++;
      query += ` AND pl.played_at >= $${paramCount}::timestamp`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      query += ` AND pl.played_at < $${paramCount}::timestamp + INTERVAL '1 day'`;
      params.push(date_to);
    }

    query += ' ORDER BY pl.played_at DESC';

    // Count total for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(parseInt(offset));

    const result = await pool.query(query, params);
    res.json({
      success: true,
      playback_logs: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get playback logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get device location history
router.get('/location/:device_id', auth, async (req, res) => {
  try {
    const { limit } = req.query;
    let query = 'SELECT * FROM device_location_history WHERE device_id = $1 ORDER BY recorded_at DESC';
    const params = [req.params.device_id];

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    } else {
      query += ' LIMIT 1000';
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get device status history
router.get('/status/:device_id', auth, async (req, res) => {
  try {
    const { limit } = req.query;
    let query = 'SELECT * FROM device_status_history WHERE device_id = $1 ORDER BY recorded_at DESC';
    const params = [req.params.device_id];

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    } else {
      query += ' LIMIT 1000';
    }

    const result = await pool.query(query, params);
    res.json({
      success: true,
      status_history: result.rows
    });
  } catch (error) {
    console.error('Get status history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
