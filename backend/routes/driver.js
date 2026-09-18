const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Driver Login
router.post('/login', [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').trim().notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone, password } = req.body;

    const result = await pool.query('SELECT * FROM drivers WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const driver = result.rows[0];

    if (driver.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Your account is disabled' });
    }

    const isMatch = await bcrypt.compare(password, driver.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const token = jwt.sign(
      { id: driver.id, role: 'Driver' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicle_type: driver.vehicle_type,
        vehicle_number: driver.vehicle_number
      }
    });
  } catch (error) {
    console.error('Driver login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Driver Dashboard Stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const driverId = req.user.id;

    // Get today's stats
    const statsRes = await pool.query(
      `SELECT distance_km, active_minutes, income, ads_played 
       FROM driver_daily_stats 
       WHERE driver_id = $1 AND date = CURRENT_DATE`,
      [driverId]
    );

    const todayStats = statsRes.rows.length > 0 ? statsRes.rows[0] : {
      distance_km: 0,
      active_minutes: 0,
      income: 0,
      ads_played: 0
    };

    // Get current device status and vehicle info
    const deviceRes = await pool.query(
      `SELECT d.id as device_id, d.status, d.adsd_id, d.last_seen, dr.vehicle_type, dr.vehicle_number, a.title as currently_playing_title
       FROM drivers dr
       LEFT JOIN devices d ON dr.device_id = d.id
       LEFT JOIN ads a ON d.last_ad_id = a.id
       WHERE dr.id = $1`,
      [driverId]
    );

    const deviceInfo = deviceRes.rows[0] || {};
    
    // Get real playback statistics for today
    let playbackStats = {
      total_ads_played: 0,
      total_playback_seconds: 0,
      ads_breakdown: [],
      currently_playing: null
    };

    if (deviceInfo.device_id) {
      // Aggregate stats
      const plAgg = await pool.query(
        `SELECT COUNT(id) as total_ads, COALESCE(SUM(duration), 0) as total_seconds
         FROM playback_logs 
         WHERE device_id = $1 AND DATE(played_at) = CURRENT_DATE`,
        [deviceInfo.device_id]
      );
      
      // Breakdown by ad
      const plBreakdown = await pool.query(
        `SELECT a.title, COUNT(pl.id) as play_count
         FROM playback_logs pl
         LEFT JOIN ads a ON pl.ad_id = a.id
         WHERE pl.device_id = $1 AND DATE(pl.played_at) = CURRENT_DATE
         GROUP BY a.title`,
        [deviceInfo.device_id]
      );
      
      // Currently playing logic relies on device heartbeat now
      playbackStats.total_ads_played = parseInt(plAgg.rows[0]?.total_ads || 0);
      playbackStats.total_playback_seconds = parseInt(plAgg.rows[0]?.total_seconds || 0);
      playbackStats.ads_breakdown = plBreakdown.rows;
      playbackStats.currently_playing = deviceInfo.currently_playing_title || 'None (Idle)';
    }

    res.json({
      success: true,
      dashboard: {
        today: todayStats,
        playback: playbackStats,
        device: {
          status: deviceInfo.status || 'Offline',
          last_seen: deviceInfo.last_seen,
          adsd_id: deviceInfo.adsd_id || 'Not Assigned',
          vehicle_type: deviceInfo.vehicle_type,
          vehicle_number: deviceInfo.vehicle_number
        }
      }
    });
  } catch (error) {
    console.error('Driver dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Driver History (Last 7 Days)
router.get('/history', auth, async (req, res) => {
  try {
    const driverId = req.user.id;
    const historyRes = await pool.query(
      `SELECT date, distance_km, active_minutes, income, ads_played 
       FROM driver_daily_stats 
       WHERE driver_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY date ASC`,
      [driverId]
    );

    res.json({
      success: true,
      history: historyRes.rows
    });
  } catch (error) {
    console.error('Driver history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Driver Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const driverId = req.user.id;
    const result = await pool.query(
      `SELECT name, phone, vehicle_type, vehicle_number, status, created_at 
       FROM drivers WHERE id = $1`,
      [driverId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Driver profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
