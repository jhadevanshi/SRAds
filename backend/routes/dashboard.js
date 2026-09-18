const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Total devices
    const totalDevices = await pool.query('SELECT COUNT(*) as count FROM devices');

    // Online devices
    const onlineDevices = await pool.query("SELECT COUNT(*) as count FROM devices WHERE status = 'Online'");

    // Offline devices
    const offlineDevices = await pool.query("SELECT COUNT(*) as count FROM devices WHERE status = 'Offline'");

    // Active campaigns
    const activeCampaigns = await pool.query("SELECT COUNT(*) as count FROM campaigns WHERE status = 'Active'");

    // Registered advertisers
    const registeredAdvertisers = await pool.query("SELECT COUNT(*) as count FROM advertisers");

    // Total ads
    const totalAds = await pool.query("SELECT COUNT(*) as count FROM ads WHERE status = 'Active'");

    // Total media
    const totalMedia = await pool.query("SELECT COUNT(*) as count FROM media");

    // Today's impressions (from playback logs)
    const todayImpressions = await pool.query(
      "SELECT COUNT(*) as count FROM playback_logs WHERE played_at >= CURRENT_DATE"
    );

    // Today's active devices (devices that sent heartbeat today)
    const todayActiveDevices = await pool.query(
      "SELECT COUNT(*) as count FROM devices WHERE last_seen >= CURRENT_DATE"
    );

    res.json({
      success: true,
      stats: {
        total_devices: parseInt(totalDevices.rows[0].count),
        online_devices: parseInt(onlineDevices.rows[0].count),
        offline_devices: parseInt(offlineDevices.rows[0].count),
        active_campaigns: parseInt(activeCampaigns.rows[0].count),
        registered_advertisers: parseInt(registeredAdvertisers.rows[0].count),
        total_ads: parseInt(totalAds.rows[0].count),
        total_media: parseInt(totalMedia.rows[0].count),
        today_impressions: parseInt(todayImpressions.rows[0].count),
        today_active_devices: parseInt(todayActiveDevices.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get ads uploaded this week
router.get('/ads-this-week', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ads
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get ads this week error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get online devices trend
router.get('/online-devices-trend', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DATE(recorded_at) as date, COUNT(DISTINCT device_id) as count
      FROM device_status_history
      WHERE recorded_at >= CURRENT_DATE - INTERVAL '7 days'
      AND status = 'Online'
      GROUP BY DATE(recorded_at)
      ORDER BY date ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get online devices trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get campaign performance
router.get('/campaign-performance', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.campaign_name, c.id, COUNT(pl.id) as impressions
      FROM campaigns c
      LEFT JOIN playback_logs pl ON c.id = pl.campaign_id
      WHERE c.status = 'Active'
      GROUP BY c.id, c.campaign_name
      ORDER BY impressions DESC
      LIMIT 10`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get campaign performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get device uptime analytics
router.get('/device-uptime', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_devices,
        COUNT(CASE WHEN status = 'Online' THEN 1 END) as online_count,
        COUNT(CASE WHEN status = 'Offline' THEN 1 END) as offline_count,
        ROUND(COUNT(CASE WHEN status = 'Online' THEN 1 END) * 100.0 / COUNT(*), 2) as online_percentage
      FROM devices`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get device uptime error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get recent activity
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name as admin_name
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20`
    );

    res.json({
      success: true,
      activities: result.rows
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get live devices data
router.get('/live-devices', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        d.id,
        d.adsd_id,
        d.device_name,
        d.vehicle_type,
        d.vehicle_number,
        d.status,
        d.latitude,
        d.longitude,
        d.gps_status,
        d.internet_status,
        d.battery_level,
        d.heartbeat_at,
        d.last_seen,
        a.title as current_ad,
        (
          SELECT c.campaign_name 
          FROM playback_logs pl 
          JOIN campaigns c ON pl.campaign_id = c.id 
          WHERE pl.device_id = d.id 
          ORDER BY pl.played_at DESC 
          LIMIT 1
        ) as current_campaign,
        CASE 
          WHEN d.last_seen >= NOW() - INTERVAL '2 minutes' THEN 'Online'
          ELSE 'Offline'
        END as real_status
      FROM devices d
      LEFT JOIN ads a ON d.last_ad_id = a.id
      ORDER BY d.status DESC, d.last_seen DESC`
    );

    res.json({
      success: true,
      devices: result.rows
    });
  } catch (error) {
    console.error('Get live devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get ads by type stats (campaign vs general)
router.get('/ads-by-type', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ad_type,
        COUNT(*) as count
      FROM ads
      WHERE status = 'Active'
      GROUP BY ad_type`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get ads by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get today's playback statistics
router.get('/today-playback', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('hour', played_at) as hour,
        COUNT(*) as count
      FROM playback_logs
      WHERE played_at >= CURRENT_DATE
      GROUP BY DATE_TRUNC('hour', played_at)
      ORDER BY hour ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get today playback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get recent playback logs for dashboard
router.get('/recent-playback', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        pl.id,
        pl.played_at,
        pl.duration,
        d.device_name,
        d.vehicle_number,
        a.title as ad_title,
        c.campaign_name
      FROM playback_logs pl
      LEFT JOIN devices d ON pl.device_id = d.id
      LEFT JOIN ads a ON pl.ad_id = a.id
      LEFT JOIN campaigns c ON pl.campaign_id = c.id
      ORDER BY pl.played_at DESC
      LIMIT 20`
    );

    res.json({
      success: true,
      playback_logs: result.rows
    });
  } catch (error) {
    console.error('Get recent playback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
