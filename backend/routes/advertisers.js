const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const https = require('https');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * Make a GET request using Node's built-in https module.
 * More reliable than fetch() on some Windows environments.
 */
function httpsGet(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'SRAds-AdminPanel/1.0 (contact@srads.com)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, body: JSON.parse(data) });
        } catch {
          resolve({ ok: false, body: null });
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', reject);
  });
}

/**
 * Geocode an area/locality using OpenStreetMap Nominatim.
 * Tries progressively shorter queries to maximise the chance of a match.
 * Returns { latitude, longitude } on success, or null on failure.
 */
async function geocodeArea(area, city, state) {
  const queries = [
    [area, city, state],
    [area, city],
    [area, state],
    [area],
  ]
    .map(parts => parts.filter(Boolean))
    .filter(parts => parts.length > 0)
    .filter((parts, idx, arr) => {
      const str = parts.join(', ');
      return arr.findIndex(p => p.join(', ') === str) === idx;
    });

  for (const parts of queries) {
    const q = encodeURIComponent(parts.join(', '));
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`;

    try {
      const { ok, body } = await httpsGet(url, 15000);
      if (!ok || !Array.isArray(body) || body.length === 0) continue;

      const { lat, lon } = body[0];
      console.log(`[Geocoding] Resolved "${parts.join(', ')}" → ${lat}, ${lon}`);
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (err) {
      console.error(`[Geocoding] Query "${parts.join(', ')}" failed: ${err.message}`);
      // Network is unreachable — no point trying further queries
      break;
    }
  }

  return null;
}

// Get all advertisers
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = 'SELECT * FROM advertisers WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (company_name ILIKE $${paramCount} OR owner_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      advertisers: result.rows
    });
  } catch (error) {
    console.error('Get advertisers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single advertiser
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM advertisers WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    res.json({
      success: true,
      advertiser: result.rows[0]
    });
  } catch (error) {
    console.error('Get advertiser error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get advertiser details with ads, campaigns, and media
router.get('/:id/details', auth, async (req, res) => {
  try {
    const advertiserResult = await pool.query(
      'SELECT * FROM advertisers WHERE id = $1',
      [req.params.id]
    );

    if (advertiserResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    const advertiser = advertiserResult.rows[0];

    // Get all ads for this advertiser
    const adsResult = await pool.query(
      `SELECT a.*, m.file_url, m.media_type, m.duration as media_duration
      FROM ads a
      LEFT JOIN media m ON a.media_id = m.id
      WHERE a.advertiser_id = $1
      ORDER BY a.created_at DESC`,
      [req.params.id]
    );

    // Get all campaigns for this advertiser
    const campaignsResult = await pool.query(
      `SELECT c.*, COUNT(DISTINCT ca.ad_id) as ad_count
      FROM campaigns c
      LEFT JOIN campaign_ads ca ON c.id = ca.campaign_id
      WHERE c.advertiser_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [req.params.id]
    );

    // Get media uploaded through ads for this advertiser
    const mediaResult = await pool.query(
      `SELECT DISTINCT m.*
      FROM media m
      INNER JOIN ads a ON a.media_id = m.id
      WHERE a.advertiser_id = $1
      ORDER BY m.created_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      advertiser,
      ads: adsResult.rows,
      campaigns: campaignsResult.rows,
      media: mediaResult.rows
    });
  } catch (error) {
    console.error('Get advertiser details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create advertiser
router.post('/', adminAuth, [
  body('company_name').trim().notEmpty().withMessage('Company name is required'),
  body('owner_name').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      company_name,
      owner_name,
      email,
      phone,
      gst,
      address,
      area,
      city,
      state,
      business_type,
      skip_geocoding   // true when admin explicitly confirms saving without coordinates
    } = req.body;

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM advertisers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Advertiser with this email already exists'
      });
    }

    // --- Geocoding ---
    let latitude  = null;
    let longitude = null;

    if (!skip_geocoding) {
      const coords = await geocodeArea(area, city, state);

      if (!coords) {
        return res.status(422).json({
          success: false,
          geocoding_failed: true,
          message: 'Unable to locate the entered area. Please check the spelling of Area, City, and State, or save without coordinates.'
        });
      }

      latitude  = coords.latitude;
      longitude = coords.longitude;
    }

    const result = await pool.query(
      `INSERT INTO advertisers
        (company_name, owner_name, email, phone, gst, address, city, state, business_type, latitude, longitude, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [company_name, owner_name, email, phone, gst, address, city, state,
       business_type || 'General', latitude, longitude, 'Active']
    );

    // Log the action (non-blocking — failure here should not prevent advertiser creation)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Advertiser Created', 'Advertisers', `Created advertiser: ${company_name}`]
      );
    } catch (logErr) {
      console.error('Admin log insertion failed (non-critical):', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Advertiser created successfully',
      advertiser: result.rows[0]
    });
  } catch (error) {
    console.error('Create advertiser error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update advertiser
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      company_name,
      owner_name,
      email,
      phone,
      gst,
      address,
      area,
      city,
      state,
      business_type,
      status,
      skip_geocoding   // true when admin explicitly confirms saving without coordinates
    } = req.body;

    // Check if advertiser exists
    const existing = await pool.query(
      'SELECT * FROM advertisers WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    const prev = existing.rows[0];

    // Check for email conflict
    if (email && email !== prev.email) {
      const emailConflict = await pool.query(
        'SELECT id FROM advertisers WHERE email = $1 AND id != $2',
        [email, req.params.id]
      );
      if (emailConflict.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another advertiser'
        });
      }
    }

    // --- Geocoding ---
    // Re-geocode only when any location field actually changed
    const resolvedArea  = area  ?? prev.area;
    const resolvedCity  = city  ?? prev.city;
    const resolvedState = state ?? prev.state;

    const locationChanged =
      (area  !== undefined && area  !== prev.area)  ||
      (city  !== undefined && city  !== prev.city)  ||
      (state !== undefined && state !== prev.state);

    let newLatitude  = prev.latitude;
    let newLongitude = prev.longitude;

    if (locationChanged && !skip_geocoding) {
      const coords = await geocodeArea(resolvedArea, resolvedCity, resolvedState);

      if (!coords) {
        return res.status(422).json({
          success: false,
          geocoding_failed: true,
          message: 'Unable to locate the entered area. Please check the spelling of Area, City, and State, or save without coordinates.'
        });
      }

      newLatitude  = coords.latitude;
      newLongitude = coords.longitude;
    }

    const result = await pool.query(
      `UPDATE advertisers SET
        company_name  = COALESCE($1,  company_name),
        owner_name    = COALESCE($2,  owner_name),
        email         = COALESCE($3,  email),
        phone         = COALESCE($4,  phone),
        gst           = COALESCE($5,  gst),
        address       = COALESCE($6,  address),
        city          = COALESCE($7,  city),
        state         = COALESCE($8,  state),
        business_type = COALESCE($9,  business_type),
        status        = COALESCE($10, status),
        latitude      = $11,
        longitude     = $12
      WHERE id = $13
      RETURNING *`,
      [company_name, owner_name, email, phone, gst, address,
       city, state, business_type, status,
       newLatitude, newLongitude,
       req.params.id]
    );

    // Log the action (non-blocking — failure here should not prevent advertiser update)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Advertiser Updated', 'Advertisers', `Updated advertiser: ${result.rows[0].company_name}`]
      );
    } catch (logErr) {
      console.error('Admin log insertion failed (non-critical):', logErr.message);
    }

    res.json({
      success: true,
      message: 'Advertiser updated successfully',
      advertiser: result.rows[0]
    });
  } catch (error) {
    console.error('Update advertiser error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete advertiser
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM advertisers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Advertiser Deleted', 'Advertisers', `Deleted advertiser: ${result.rows[0].company_name}`]
      );
    } catch (logErr) {
      console.error('Admin log insertion failed (non-critical):', logErr.message);
    }

    res.json({
      success: true,
      message: 'Advertiser deleted successfully'
    });
  } catch (error) {
    console.error('Delete advertiser error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
