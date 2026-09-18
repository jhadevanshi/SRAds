const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get all ads
router.get('/', auth, async (req, res) => {
  try {
    const { advertiser_id, status } = req.query;
    let query = `
      SELECT a.*, 
        m.file_url,
        m.media_type,
        m.duration,
        adv.company_name as advertiser_name
      FROM ads a
      LEFT JOIN media m ON a.media_id = m.id
      LEFT JOIN advertisers adv ON a.advertiser_id = adv.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (advertiser_id) {
      paramCount++;
      query += ` AND a.advertiser_id = $${paramCount}`;
      params.push(advertiser_id);
    }

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      ads: result.rows
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single ad
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        m.file_url,
        m.media_type,
        m.duration,
        adv.company_name as advertiser_name
      FROM ads a
      LEFT JOIN media m ON a.media_id = m.id
      LEFT JOIN advertisers adv ON a.advertiser_id = adv.id
      WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    res.json({
      success: true,
      ad: result.rows[0]
    });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create ad
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('advertiser_id').isInt().withMessage('Valid advertiser ID is required'),
  body('media_id').isInt().withMessage('Valid media ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, advertiser_id, media_id, category, ad_type, play_duration } = req.body;

    // Verify advertiser exists
    const advertiser = await pool.query(
      'SELECT id FROM advertisers WHERE id = $1',
      [advertiser_id]
    );

    if (advertiser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    // Verify media exists
    const media = await pool.query(
      'SELECT id FROM media WHERE id = $1',
      [media_id]
    );

    if (media.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    const result = await pool.query(
      'INSERT INTO ads (title, advertiser_id, media_id, category, ad_type, play_duration, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, advertiser_id, media_id, category || null, ad_type || 'GENERAL', play_duration || 15, 'Active']
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Ad Created', 'Ads', `Created ad: ${title}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      ad: result.rows[0]
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update ad
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, advertiser_id, media_id, category, status, ad_type, play_duration } = req.body;

    // Check if ad exists
    const existing = await pool.query(
      'SELECT * FROM ads WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    const result = await pool.query(
      'UPDATE ads SET title = COALESCE($1, title), advertiser_id = COALESCE($2, advertiser_id), media_id = COALESCE($3, media_id), category = COALESCE($4, category), status = COALESCE($5, status), ad_type = COALESCE($6, ad_type), play_duration = COALESCE($7, play_duration) WHERE id = $8 RETURNING *',
      [title, advertiser_id, media_id, category, status, ad_type, play_duration, req.params.id]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Ad Updated', 'Ads', `Updated ad: ${result.rows[0].title}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Ad updated successfully',
      ad: result.rows[0]
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete ad
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM ads WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Ad Deleted', 'Ads', `Deleted ad: ${result.rows[0].title}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
