const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const { advertiser_id, status } = req.query;
    let query = `
      SELECT c.*, 
        adv.company_name as advertiser_name,
        COUNT(DISTINCT ca.ad_id) as ad_count
      FROM campaigns c
      LEFT JOIN advertisers adv ON c.advertiser_id = adv.id
      LEFT JOIN campaign_ads ca ON c.id = ca.campaign_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (advertiser_id) {
      paramCount++;
      query += ` AND c.advertiser_id = $${paramCount}`;
      params.push(advertiser_id);
    }

    if (status) {
      paramCount++;
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
    }

    query += ' GROUP BY c.id, adv.company_name ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      campaigns: result.rows
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single campaign with details
router.get('/:id', auth, async (req, res) => {
  try {
    const campaignResult = await pool.query(
      `SELECT c.*, adv.company_name as advertiser_name
      FROM campaigns c
      LEFT JOIN advertisers adv ON c.advertiser_id = adv.id
      WHERE c.id = $1`,
      [req.params.id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const campaign = campaignResult.rows[0];

    // Get campaign ads
    const adsResult = await pool.query(
      `SELECT ca.*, a.title, m.file_url, m.media_type, m.duration
      FROM campaign_ads ca
      LEFT JOIN ads a ON ca.ad_id = a.id
      LEFT JOIN media m ON a.media_id = m.id
      WHERE ca.campaign_id = $1
      ORDER BY ca.play_order`,
      [req.params.id]
    );

    res.json({
      success: true,
      campaign: {
        ...campaign,
        ads: adsResult.rows
      }
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create campaign
router.post('/', adminAuth, [
  body('campaign_name').trim().notEmpty().withMessage('Campaign name is required'),
  body('advertiser_id').isInt().withMessage('Valid advertiser ID is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      campaign_name,
      advertiser_id,
      start_date,
      end_date,
      priority,
      budget,
      area
    } = req.body;

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

    const result = await pool.query(
      'INSERT INTO campaigns (campaign_name, advertiser_id, start_date, end_date, priority, budget, area, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [campaign_name, advertiser_id, start_date, end_date, priority || 1, budget || null, area || null, 'Active']
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Campaign Created', 'Campaigns', `Created campaign: ${campaign_name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update campaign
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      campaign_name,
      advertiser_id,
      start_date,
      end_date,
      priority,
      budget,
      status,
      area
    } = req.body;

    // Check if campaign exists
    const existing = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const result = await pool.query(
      'UPDATE campaigns SET campaign_name = COALESCE($1, campaign_name), advertiser_id = COALESCE($2, advertiser_id), start_date = COALESCE($3, start_date), end_date = COALESCE($4, end_date), priority = COALESCE($5, priority), budget = COALESCE($6, budget), status = COALESCE($7, status), area = COALESCE($8, area), updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [campaign_name, advertiser_id, start_date, end_date, priority, budget, status, area, req.params.id]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Campaign Updated', 'Campaigns', `Updated campaign: ${result.rows[0].campaign_name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete campaign
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Campaign Deleted', 'Campaigns', `Deleted campaign: ${result.rows[0].campaign_name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add ad to campaign
router.post('/:id/ads', adminAuth, [
  body('ad_id').isInt().withMessage('Valid ad ID is required'),
  body('play_order').isInt().withMessage('Valid play order is required'),
  body('duration').isInt().withMessage('Valid duration is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { ad_id, play_order, duration } = req.body;

    // Check if campaign exists
    const campaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [req.params.id]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const result = await pool.query(
      'INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, ad_id, play_order, duration]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Ad Added to Campaign', 'Campaigns', `Added ad ${ad_id} to campaign ${req.params.id}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Ad added to campaign successfully',
      campaign_ad: result.rows[0]
    });
  } catch (error) {
    console.error('Add ad to campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove ad from campaign
router.delete('/:id/ads/:ad_id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM campaign_ads WHERE campaign_id = $1 AND ad_id = $2 RETURNING *',
      [req.params.id, req.params.ad_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found in campaign'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Ad Removed from Campaign', 'Campaigns', `Removed ad ${req.params.ad_id} from campaign ${req.params.id}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Ad removed from campaign successfully'
    });
  } catch (error) {
    console.error('Remove ad from campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Devices are no longer manually assigned to campaigns
// Campaign selection is based on GPS location only
// These endpoints are removed as per new architecture

// Sync full playlist for a campaign (replace all ads with ordered list)
router.put('/:id/playlist', adminAuth, async (req, res) => {
  try {
    const { ads } = req.body;
    // ads: [{ ad_id, play_order, duration }]

    if (!Array.isArray(ads)) {
      return res.status(400).json({
        success: false,
        message: 'ads must be an array'
      });
    }

    // Check if campaign exists
    const campaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [req.params.id]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Delete all existing ads for this campaign
    await pool.query('DELETE FROM campaign_ads WHERE campaign_id = $1', [req.params.id]);

    // Insert new ordered playlist
    if (ads.length > 0) {
      const values = ads.map((ad, idx) =>
        `($1, ${parseInt(ad.ad_id)}, ${idx}, ${parseInt(ad.duration) || 15})`
      ).join(', ');

      await pool.query(
        `INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ${values}`,
        [req.params.id]
      );
    }

    // Fetch updated campaign with ads
    const updatedAds = await pool.query(
      `SELECT ca.*, a.title, a.ad_type, m.file_url, m.media_type, m.duration as media_duration
      FROM campaign_ads ca
      LEFT JOIN ads a ON ca.ad_id = a.id
      LEFT JOIN media m ON a.media_id = m.id
      WHERE ca.campaign_id = $1
      ORDER BY ca.play_order`,
      [req.params.id]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Campaign Playlist Updated', 'Campaigns', `Updated playlist for campaign ${req.params.id} with ${ads.length} ads`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Campaign playlist updated successfully',
      ads: updatedAds.rows
    });
  } catch (error) {
    console.error('Sync playlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
