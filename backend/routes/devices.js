const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Haversine distance calculator
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Device login endpoint (no auth required)
router.post('/login', [body('adsdId').trim().notEmpty().withMessage('AdsD ID is required')], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { adsdId } = req.body;
    const normalizedAdsdId = adsdId.trim();

    // Find device by ADSD ID, case-insensitive matching
    const result = await pool.query(
      'SELECT * FROM devices WHERE LOWER(adsd_id) = LOWER($1)',
      [normalizedAdsdId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid AdsD ID'
      });
    }

    const device = result.rows[0];

    // Update device status to Online (also set heartbeat_at to prevent false offline detection)
    await pool.query('UPDATE devices SET status = $1, last_seen = CURRENT_TIMESTAMP, heartbeat_at = CURRENT_TIMESTAMP WHERE id = $2', ['Online', device.id]);

    // Generate JWT token
    const token = jwt.sign(
      { deviceId: device.id, adsdId: device.adsd_id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Return device data and token
    res.json({
      success: true,
      token,
      device: {
        id: device.id,
        adsd_id: device.adsd_id,
        device_name: device.device_name,
        vehicle_type: device.vehicle_type,
        vehicle_number: device.vehicle_number,
        status: 'Online'
      }
    });
  } catch (error) {
    console.error('Device login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get all devices
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, vehicle_type } = req.query;
    let query = `
      SELECT d.*, 
        i.name as installer_name,
        dr.name as driver_name
      FROM devices d
      LEFT JOIN installers i ON d.installer_id = i.id
      LEFT JOIN drivers dr ON dr.device_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (d.adsd_id ILIKE $${paramCount} OR d.device_name ILIKE $${paramCount} OR d.vehicle_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
    }

    if (vehicle_type) {
      paramCount++;
      query += ` AND d.vehicle_type = $${paramCount}`;
      params.push(vehicle_type);
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    
    // For each device, fetch today's stats if there is a driver
    for (let device of result.rows) {
      if (device.driver_name) {
        const statsRes = await pool.query(
          `SELECT distance_km, active_minutes, income FROM driver_daily_stats 
           WHERE driver_id = (SELECT id FROM drivers WHERE device_id = $1) 
           AND date = CURRENT_DATE`,
          [device.id]
        );
        if (statsRes.rows.length > 0) {
          device.today_distance = statsRes.rows[0].distance_km;
          device.today_active_minutes = statsRes.rows[0].active_minutes;
          device.today_income = statsRes.rows[0].income;
        } else {
          device.today_distance = 0;
          device.today_active_minutes = 0;
          device.today_income = 0;
        }
      }
    }

    res.json({
      success: true,
      devices: result.rows
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single device
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, 
        i.name as installer_name
      FROM devices d
      LEFT JOIN installers i ON d.installer_id = i.id
      WHERE d.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      device: result.rows[0]
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get device details with history
router.get('/:id/details', auth, async (req, res) => {
  try {
    const deviceResult = await pool.query(
      `SELECT d.*, 
        i.name as installer_name,
        i.phone as installer_phone
      FROM devices d
      LEFT JOIN installers i ON d.installer_id = i.id
      WHERE d.id = $1`,
      [req.params.id]
    );

    if (deviceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const device = deviceResult.rows[0];

    const playbackHistory = await pool.query(
      `SELECT 
        pl.played_at,
        pl.duration,
        a.title as ad_title,
        c.campaign_name,
        c.area
      FROM playback_logs pl
      LEFT JOIN ads a ON pl.ad_id = a.id
      LEFT JOIN campaigns c ON pl.campaign_id = c.id
      WHERE pl.device_id = $1
      ORDER BY pl.played_at DESC
      LIMIT 50`,
      [req.params.id]
    );

    const locationHistory = await pool.query(
      `SELECT 
        latitude,
        longitude,
        speed,
        recorded_at
      FROM device_location_history
      WHERE device_id = $1
      ORDER BY recorded_at DESC
      LIMIT 100`,
      [req.params.id]
    );

    const statusHistory = await pool.query(
      `SELECT 
        internet,
        gps,
        status,
        battery_level,
        recorded_at
      FROM device_status_history
      WHERE device_id = $1
      ORDER BY recorded_at DESC
      LIMIT 50`,
      [req.params.id]
    );

    res.json({
      success: true,
      device,
      playback_history: playbackHistory.rows,
      location_history: locationHistory.rows,
      status_history: statusHistory.rows
    });
  } catch (error) {
    console.error('Get device details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create device
router.post('/', adminAuth, [
  body('adsd_id').trim().notEmpty().withMessage('AdsD ID is required'),
  body('device_name').trim().notEmpty().withMessage('Device name is required'),
  body('vehicle_type').isIn(['Auto', 'BRTS']).withMessage('Invalid vehicle type'),
  body('installer_id').optional().isInt().withMessage('Installer ID must be a valid integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      adsd_id,
      serial_number,
      device_name,
      vehicle_type,
      vehicle_number,
      installation_date,
      installer_id
    } = req.body;

    const existing = await pool.query(
      'SELECT id FROM devices WHERE adsd_id = $1',
      [adsd_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Device with this AdsD ID already exists'
      });
    }

    const result = await pool.query(
      'INSERT INTO devices (adsd_id, serial_number, device_name, vehicle_type, vehicle_number, installation_date, installer_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [adsd_id, serial_number, device_name, vehicle_type, vehicle_number, installation_date, installer_id || null, 'Offline']
    );

    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Device Created', 'Devices', `Created device: ${device_name} (${adsd_id})`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      device: result.rows[0]
    });
  } catch (error) {
    console.error('Create device error:', error);
    if (error.code === '23503') {
      if (error.constraint === 'devices_installer_id_fkey') {
        return res.status(400).json({
          success: false,
          message: 'Installer not found. Please create an installer first or leave the installer field empty.'
        });
      }
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update device
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      serial_number,
      device_name,
      vehicle_type,
      vehicle_number,
      installation_date,
      installer_id,
      status,
      latitude,
      longitude,
      gps_status,
      internet_status,
      battery_level
    } = req.body;

    const existing = await pool.query(
      'SELECT * FROM devices WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const result = await pool.query(
      `UPDATE devices SET 
        serial_number = COALESCE($1, serial_number),
        device_name = COALESCE($2, device_name),
        vehicle_type = COALESCE($3, vehicle_type),
        vehicle_number = COALESCE($4, vehicle_number),
        installation_date = COALESCE($5, installation_date),
        installer_id = COALESCE($6, installer_id),
        status = COALESCE($7, status),
        latitude = COALESCE($8, latitude),
        longitude = COALESCE($9, longitude),
        gps_status = COALESCE($10, gps_status),
        internet_status = COALESCE($11, internet_status),
        battery_level = COALESCE($12, battery_level),
        last_seen = COALESCE($13, last_seen),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 RETURNING *`,
      [serial_number, device_name, vehicle_type, vehicle_number, installation_date, installer_id, status, latitude, longitude, gps_status, internet_status, battery_level, new Date(), req.params.id]
    );

    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Device Updated', 'Devices', `Updated device: ${result.rows[0].device_name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Device updated successfully',
      device: result.rows[0]
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete device
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM devices WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Device Deleted', 'Devices', `Deleted device: ${result.rows[0].device_name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update device status (for device heartbeat)
router.post('/:id/status', async (req, res) => {
  try {
    const { latitude, longitude, gps_status, internet_status, battery_level, currently_playing_ad } = req.body;

    console.log('[Device Status] Device ID:', req.params.id);

    const currentDeviceRes = await pool.query('SELECT * FROM devices WHERE id = $1', [req.params.id]);
    if (currentDeviceRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }
    const currentDevice = currentDeviceRes.rows[0];

    // Calculate Driver Stats updates
    let distanceAdded = 0;
    if (currentDevice.latitude && currentDevice.longitude && latitude && longitude) {
      distanceAdded = getDistance(currentDevice.latitude, currentDevice.longitude, latitude, longitude);
      if (distanceAdded > 5) distanceAdded = 0; // Ignore absurd jumps (e.g. > 5km per heartbeat)
    }

    let activeMinutesAdded = 0;
    if (currentDevice.status === 'Online' && currentDevice.heartbeat_at) {
      const diffMinutes = (new Date() - new Date(currentDevice.heartbeat_at)) / 60000;
      if (diffMinutes > 0 && diffMinutes <= 2) { // Heartbeats are expected every minute or so
        activeMinutesAdded = diffMinutes;
      }
    }

    const safeGps = ['Active', 'Inactive', 'Unknown'].includes(gps_status) ? gps_status : 'Unknown';
    const safeInternet = ['Connected', 'Disconnected', 'Unknown'].includes(internet_status) ? internet_status : 'Unknown';

    let lastAdId = null;
    if (currently_playing_ad && currently_playing_ad !== 'none') {
      if (typeof currently_playing_ad === 'string' && currently_playing_ad.startsWith('Ad-')) {
        lastAdId = parseInt(currently_playing_ad.replace('Ad-', ''), 10);
      } else {
        lastAdId = parseInt(currently_playing_ad, 10);
      }
      if (isNaN(lastAdId)) lastAdId = null;
    }

    const result = await pool.query(
      `UPDATE devices SET 
        latitude        = COALESCE($1, latitude),
        longitude       = COALESCE($2, longitude),
        gps_status      = $3,
        internet_status = $4,
        battery_level   = COALESCE($5, battery_level),
        last_ad_id      = $6,
        last_seen       = CURRENT_TIMESTAMP,
        heartbeat_at    = CURRENT_TIMESTAMP,
        status          = 'Online',
        updated_at      = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [latitude, longitude, safeGps, safeInternet, battery_level, lastAdId, req.params.id]
    );

    // Apply driver stats
    try {
      const driverRes = await pool.query('SELECT id FROM drivers WHERE device_id = $1', [req.params.id]);
      if (driverRes.rows.length > 0) {
        const driverId = driverRes.rows[0].id;
        
        // Fetch rates
        const settingsRes = await pool.query("SELECT key, value FROM settings WHERE key IN ('earning_rate_per_km', 'earning_rate_per_hour')");
        let ratePerKm = 4, ratePerHour = 15;
        settingsRes.rows.forEach(s => {
          if (s.key === 'earning_rate_per_km') ratePerKm = parseFloat(s.value);
          if (s.key === 'earning_rate_per_hour') ratePerHour = parseFloat(s.value);
        });

        const incomeAdded = (distanceAdded * ratePerKm) + ((activeMinutesAdded / 60) * ratePerHour);

        await pool.query(`
          INSERT INTO driver_daily_stats (driver_id, date, distance_km, active_minutes, income, ads_played)
          VALUES ($1, CURRENT_DATE, $2, $3, $4, 0)
          ON CONFLICT (driver_id, date) DO UPDATE SET 
            distance_km = driver_daily_stats.distance_km + EXCLUDED.distance_km,
            active_minutes = driver_daily_stats.active_minutes + EXCLUDED.active_minutes,
            income = driver_daily_stats.income + EXCLUDED.income,
            updated_at = CURRENT_TIMESTAMP
        `, [driverId, distanceAdded, activeMinutesAdded, incomeAdded]);
      }
    } catch (statErr) {
      console.error('[Device Status] Failed to update driver stats:', statErr.message);
    }

    // Log to status history (non-blocking)
    pool.query(
      'INSERT INTO device_status_history (device_id, internet, gps, status, battery_level) VALUES ($1, $2, $3, $4, $5)',
      [req.params.id, safeInternet, safeGps, 'Online', battery_level]
    ).catch(err => {});

    if (latitude && longitude) {
      pool.query(
        'INSERT INTO device_location_history (device_id, latitude, longitude) VALUES ($1, $2, $3)',
        [req.params.id, latitude, longitude]
      ).catch(err => {});
    }

    const forwardedProto = req.headers['x-forwarded-proto'];
    const scheme = forwardedProto ? forwardedProto.toString().split(',')[0].trim() : req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    let baseUrl = `${scheme}://${host}`;

    const toAbsolute = (url) => {
      if (!url) return url;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${baseUrl}${url}`;
    };

    let campaign = null;
    let detectedArea = 'Unknown';
    let ads = [];
    let fallback = false;
    let fallbackReason = '';

    try {
      if (latitude && longitude) {
        // Get active campaigns with advertiser locations
        const campaignResult = await pool.query(
          `SELECT c.*, a.latitude as adv_lat, a.longitude as adv_long 
          FROM campaigns c
          LEFT JOIN advertisers a ON c.advertiser_id = a.id
          WHERE c.status = 'Active' AND c.start_date <= CURRENT_DATE AND c.end_date >= CURRENT_DATE
          ORDER BY c.priority DESC, c.created_at DESC`,
          []
        );

        let closestCampaign = null;
        let minDistance = 2; // Maximum ALLOWED radius in kilometers
        const devLat = Number(latitude);
        const devLng = Number(longitude);

        console.log(`\n--- [Ad Selection] START ---`);
        console.log(`[Ad Selection] Device Location: Lat ${devLat}, Lng ${devLng}`);
        console.log(`[Ad Selection] Found ${campaignResult.rows.length} active campaigns in DB.`);

        for (const camp of campaignResult.rows) {
          if (!camp.adv_lat || !camp.adv_long) {
            console.log(`[Ad Selection] REJECTED Campaign '${camp.campaign_name}' (ID: ${camp.id}) - Reason: Advertiser has no GPS coordinates.`);
            continue;
          }

          const advLat = Number(camp.adv_lat);
          const advLng = Number(camp.adv_long);
          const dist = getDistance(devLat, devLng, advLat, advLng);
          
          if (dist <= 2) { // Strictly enforce the 2km max radius
            console.log(`[Ad Selection] ACCEPTED Campaign '${camp.campaign_name}' (ID: ${camp.id}) - Distance: ${dist.toFixed(2)} km (within 2km limit). Advertiser: Lat ${advLat}, Lng ${advLng}`);
            
            // To find the absolute closest campaign among the accepted ones
            if (dist <= minDistance) {
              minDistance = dist;
              closestCampaign = camp;
            }
          } else {
            console.log(`[Ad Selection] REJECTED Campaign '${camp.campaign_name}' (ID: ${camp.id}) - Reason: Distance ${dist.toFixed(2)} km exceeds allowed radius of 2km. Advertiser: Lat ${advLat}, Lng ${advLng}`);
          }
        }

        if (closestCampaign) {
          console.log(`[Ad Selection] WINNER: Campaign '${closestCampaign.campaign_name}' (ID: ${closestCampaign.id}) selected with shortest distance: ${minDistance.toFixed(2)} km.`);
          campaign = closestCampaign;
          detectedArea = campaign.area || campaign.campaign_name || 'Unknown';

          const adsResult = await pool.query(
            `SELECT ca.id as ca_id, ca.play_order, ca.duration as ca_duration, 
                    a.id as ad_id, a.title, a.ad_type, a.play_duration as ad_play_duration,
                    m.file_url, m.media_type, m.duration as media_duration
            FROM campaign_ads ca
            LEFT JOIN ads a ON ca.ad_id = a.id
            LEFT JOIN media m ON a.media_id = m.id
            WHERE ca.campaign_id = $1 ORDER BY ca.play_order`,
            [campaign.id]
          );

          ads = adsResult.rows.map(ad => ({
            id: ad.ad_id,
            title: ad.title,
            type: ad.media_type,
            url: toAbsolute(ad.file_url),
            duration: ad.ca_duration || ad.ad_play_duration || ad.media_duration || 15
          }));
        }
      }

      // Removed the GENERAL ads fallback logic as requested.
      // Now, if no campaign is within 1km, ads will be empty.

      if (ads.length === 0) {
        fallback = true;
        fallbackReason = 'No advertisements available';
        ads = []; // Return empty array so frontend displays "No Advertisements"
      }
    } catch (adError) {
      console.error('[Ad Selection] Error:', adError);
      fallback = true;
      fallbackReason = 'Ad selection error';
      ads = [];
    }

    res.json({
      success: true,
      message: 'Device status updated successfully',
      campaign: campaign ? { id: campaign.id, name: campaign.campaign_name, area: campaign.area } : null,
      area: detectedArea,
      ads: ads,
      playlist: ads,
      fallback: fallback,
      fallbackReason: fallbackReason
    });
  } catch (error) {
    console.error('Update device status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Log ad playback & deduct wallet balance
router.post('/:id/playback', async (req, res) => {
  const client = await pool.connect();
  try {
    const { campaignId, adId, duration, sessionId } = req.body;
    const deviceId = req.params.id;

    if (!adId || !duration) {
      return res.status(400).json({ success: false, message: 'Missing playback data' });
    }

    await client.query('BEGIN');

    // 1. Get the advertiser ID for this AD
    const adRes = await client.query('SELECT advertiser_id FROM ads WHERE id = $1', [adId]);
    if (adRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    const advertiserId = adRes.rows[0].advertiser_id;

    // Parse campaign_id safely
    const safeCampaignId = (campaignId && campaignId !== 'general' && campaignId !== 'none') ? parseInt(campaignId) : null;

    // Cost calculation: 0.02 per second
    const cost = parseFloat((duration * 0.02).toFixed(2));

    // 2. Insert into playback_logs WITH AMOUNT
    await client.query(
      `INSERT INTO playback_logs (device_id, campaign_id, ad_id, duration, playback_session_id, amount, played_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [deviceId, safeCampaignId, adId, duration, sessionId || null, cost]
    );

    // 3. Deduct from wallet transactions
    await client.query(
      `INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, status) 
       VALUES ($1, $2, 'Debit', $3, 'SUCCESS')`,
      [advertiserId, cost, `Playback deduction for Ad ID: ${adId}`]
    );

    // 4. Update the advertiser's total wallet balance
    await client.query(
      `UPDATE advertisers SET wallet_balance = wallet_balance - $1 WHERE id = $2`,
      [cost, advertiserId]
    );

    // Also update ads.total_plays counter:
    await client.query(`
      UPDATE ads 
      SET 
        total_plays = total_plays + 1,
        total_spend = total_spend + $1
      WHERE id = $2
    `, [cost, adId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Playback logged and wallet deducted' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Playback] Error logging playback:', error);
    res.status(500).json({ success: false, message: 'Failed to log playback', error: error.message, stack: error.stack });
  } finally {
    client.release();
  }
});

module.exports = router;
