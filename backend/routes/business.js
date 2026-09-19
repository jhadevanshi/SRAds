const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const pool = require('../config/database');
const upload = require('../middleware/upload');
require('dotenv').config();

// ==========================================
// Middleware: Business Authentication
// ==========================================
const businessAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    const result = await pool.query('SELECT * FROM advertisers WHERE id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Business account not found' });
    }

    const business = result.rows[0];
    if (business.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Business account is not active' });
    }

    req.businessId = business.id;
    req.advertiser = business;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ==========================================
// 1. AUTHENTICATION
// ==========================================

// Register
router.post('/register', async (req, res) => {
  try {
    const {
      company_name,
      owner_name,
      email,
      password,
      phone,
      gst,
      address,
      area,
      city,
      state,
      business_type
    } = req.body;

    if (!company_name || !owner_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Company name, owner name, email, and password are required' });
    }

    const existing = await pool.query('SELECT id FROM advertisers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(`
      INSERT INTO advertisers (
        company_name, owner_name, email, password_hash, phone, gst,
        address, area, city, state, business_type, wallet_balance, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 'Active')
      RETURNING *
    `, [
      company_name, owner_name, email, password_hash, phone || null, gst || null,
      address || null, area || null, city || null, state || null, business_type || 'General'
    ]);

    const business = result.rows[0];
    delete business.password_hash;

    const token = jwt.sign(
      { id: business.id, role: 'Business' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, business });
  } catch (error) {
    console.error('[Business Register] Error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM advertisers WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const business = result.rows[0];

    if (!business.password_hash) {
      return res.status(401).json({ success: false, message: 'Password not configured. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, business.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (business.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const token = jwt.sign(
      { id: business.id, role: 'Business' },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30d' }
    );

    delete business.password_hash;
    res.json({ success: true, token, business });
  } catch (error) {
    console.error('[Business Login] Error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
});

// Profile
router.get('/profile', businessAuth, async (req, res) => {
  const business = { ...req.advertiser };
  delete business.password_hash;
  res.json({ success: true, business });
});

router.put('/profile', businessAuth, async (req, res) => {
  try {
    const { company_name, owner_name, email, phone, address } = req.body;
    const result = await pool.query(`
      UPDATE advertisers
      SET company_name = COALESCE($1, company_name),
          owner_name = COALESCE($2, owner_name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address)
      WHERE id = $6
      RETURNING *
    `, [company_name, owner_name, email, phone, address, req.businessId]);

    const updated = result.rows[0];
    delete updated.password_hash;
    res.json({ success: true, business: updated });
  } catch (error) {
    console.error('[Business Update Profile] Error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// ==========================================
// 2. DASHBOARD & FLEET
// ==========================================

router.get('/dashboard', businessAuth, async (req, res) => {
  try {
    const adsCount = await pool.query('SELECT COUNT(*) FROM ads WHERE advertiser_id = $1', [req.businessId]);
    const playsRes = await pool.query(`
      SELECT COUNT(*) as total_plays, COALESCE(SUM(pl.duration * 0.35), 0) as total_spend
      FROM playback_logs pl
      JOIN ads a ON a.id = pl.ad_id
      WHERE a.advertiser_id = $1
    `, [req.businessId]);

    const activeDisplays = await pool.query("SELECT COUNT(*) FROM devices WHERE status = 'Online'");

    const biz = await pool.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [req.businessId]);
    const totalBalance = parseFloat(biz.rows[0]?.wallet_balance) || 0;

    const onHoldRes = await pool.query(`
      SELECT COALESCE(SUM(budget), 0) as on_hold
      FROM campaigns
      WHERE advertiser_id = $1 AND approval_status = 'Pending'
    `, [req.businessId]);
    const onHold = parseFloat(onHoldRes.rows[0]?.on_hold) || 0;
    const activeBalance = Math.max(0, totalBalance - onHold);

    res.json({
      success: true,
      stats: {
        total_ads: parseInt(adsCount.rows[0].count) || 0,
        total_plays: parseInt(playsRes.rows[0].total_plays) || 0,
        total_spend: parseFloat(playsRes.rows[0].total_spend) || 0,
        active_screens: parseInt(activeDisplays.rows[0].count) || 0,
        wallet_balance: totalBalance,
        total_balance: totalBalance,
        on_hold: onHold,
        active_balance: activeBalance
      },
      business: {
        ...req.advertiser,
        wallet_balance: totalBalance,
        total_balance: totalBalance,
        on_hold: onHold,
        active_balance: activeBalance
      }
    });
  } catch (error) {
    console.error('[Business Dashboard] Error:', error);
    res.status(500).json({ success: false, message: 'Dashboard error' });
  }
});

router.get('/live-displays', businessAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, device_id, device_name, status, latitude, longitude, battery_level, updated_at
      FROM devices
      WHERE status = 'Online'
    `);
    res.json({ success: true, displays: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/fleet/live', businessAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, device_id, device_name, status, latitude, longitude, battery_level, updated_at
      FROM devices
      WHERE status = 'Online'
    `);
    res.json({ success: true, fleet: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. ADS MANAGEMENT
// ==========================================

router.get('/ads', businessAuth, async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.title,
        m.media_type as type,
        a.approval_status,
        a.remaining_budget,
        a.budget,
        a.cost_per_play,
        a.created_at,
        m.file_url,
        m.thumbnail_url,
        COALESCE(p.total_plays, 0) AS total_plays,
        COALESCE(p.total_spend, 0) AS total_spend,
        COALESCE(today.plays_today, 0) AS plays_today,
        COALESCE(today.spend_today, 0) AS spend_today,
        COALESCE(d.distance_km, 0) AS distance_km
      FROM ads a
      LEFT JOIN media m ON a.media_id = m.id
      LEFT JOIN (
        SELECT ad_id, COUNT(*) as total_plays, SUM(duration * 0.35) as total_spend
        FROM playback_logs
        GROUP BY ad_id
      ) p ON p.ad_id = a.id
      LEFT JOIN (
        SELECT 
          ad_id,
          COUNT(*) as plays_today,
          SUM(duration * 0.35) as spend_today
        FROM playback_logs
        WHERE DATE(played_at) = CURRENT_DATE
        GROUP BY ad_id
      ) today ON today.ad_id = a.id
      LEFT JOIN (
        SELECT ad_id, SUM(distance_km) as distance_km
        FROM ad_daily_stats
        GROUP BY ad_id
      ) d ON d.ad_id = a.id
      WHERE a.advertiser_id = $1
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query, [req.businessId]);
    res.json({ success: true, ads: result.rows });
  } catch (error) {
    console.error('[Business Get Ads] Error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch ads' });
  }
});

router.post('/ads/upload', businessAuth, upload.single('media'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const { title, budget, cost_per_play, duration, area } = req.body;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const fileUrl = `/uploads/${req.file.filename}`;

    // 1. Insert Media
    const mediaRes = await client.query(`
      INSERT INTO media (title, file_name, file_url, media_type, duration, size, advertiser_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title || req.file.originalname,
      req.file.filename,
      fileUrl,
      mediaType,
      parseInt(duration) || 15,
      req.file.size,
      req.businessId
    ]);
    const media = mediaRes.rows[0];

    // 2. Insert Ad
    const numBudget = parseFloat(budget) || 1000;
    const numCostPerPlay = parseFloat(cost_per_play) || 0.35;
    const adRes = await client.query(`
      INSERT INTO ads (
        advertiser_id, media_id, title, area, budget, remaining_budget,
        cost_per_play, approval_status, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', 'Active')
      RETURNING *
    `, [
      req.businessId,
      media.id,
      title || req.file.originalname,
      area || 'General',
      numBudget,
      numBudget,
      numCostPerPlay
    ]);

    await client.query('COMMIT');
    res.json({ success: true, ad: adRes.rows[0], media });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Business Upload Ad] Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  } finally {
    client.release();
  }
});

router.delete('/ads/:id', businessAuth, async (req, res) => {
  try {
    const camRes = await pool.query('SELECT campaign_id FROM campaign_ads WHERE ad_id = $1', [req.params.id]);
    const campaignIds = camRes.rows.map(r => r.campaign_id);

    await pool.query('DELETE FROM ads WHERE id = $1 AND advertiser_id = $2', [req.params.id, req.businessId]);

    if (campaignIds.length > 0) {
      await pool.query('DELETE FROM campaigns WHERE id = ANY($1::int[])', [campaignIds]);
    }

    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('[Business Delete Ad] Error:', error);
    res.status(500).json({ success: false, message: 'Could not delete ad' });
  }
});

router.put('/ads/:id/status', businessAuth, async (req, res) => {
  try {
    const { action } = req.body;
    const newStatus = action === 'pause' ? 'Paused' : 'Active';
    const result = await pool.query(
      'UPDATE ads SET status = $1 WHERE id = $2 AND advertiser_id = $3 RETURNING *',
      [newStatus, req.params.id, req.businessId]
    );
    res.json({ success: true, ad: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. CAMPAIGNS
// ==========================================

router.get('/campaigns', businessAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(ca.ad_id) as total_ads
      FROM campaigns c
      LEFT JOIN campaign_ads ca ON ca.campaign_id = c.id
      WHERE c.advertiser_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [req.businessId]);
    res.json({ success: true, campaigns: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/campaigns', businessAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { campaign_name, start_date, end_date, start_time, end_time, budget, daily_budget, area, ad_ids } = req.body;

    const numBudget = parseFloat(budget) || 0;

    // 1. Fetch current advertiser total wallet balance with row lock
    const bizRes = await client.query('SELECT wallet_balance FROM advertisers WHERE id = $1 FOR UPDATE', [req.businessId]);
    const totalBalance = parseFloat(bizRes.rows[0]?.wallet_balance) || 0;

    // 2. Fetch existing on-hold funds for pending campaigns
    const onHoldRes = await client.query(`
      SELECT COALESCE(SUM(budget), 0) as on_hold
      FROM campaigns
      WHERE advertiser_id = $1 AND approval_status = 'Pending'
    `, [req.businessId]);
    const onHold = parseFloat(onHoldRes.rows[0]?.on_hold) || 0;
    const activeBalance = Math.max(0, totalBalance - onHold);

    // 3. Validation: Verify active unreserved balance covers the new campaign budget
    if (numBudget > activeBalance) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_ACTIVE_BALANCE',
        message: 'Campaign budget exceeds available active balance after accounting for funds on hold.',
        wallet: {
          active_balance: activeBalance,
          on_hold: onHold,
          total_balance: totalBalance,
          required: numBudget,
          shortfall: numBudget - activeBalance
        }
      });
    }

    // 4. Create Campaign in Pending approval state with allocated budget
    const result = await client.query(`
      INSERT INTO campaigns (
        campaign_name, start_date, end_date, advertiser_id, area,
        budget, daily_budget, status, approval_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', 'Pending')
      RETURNING *
    `, [
      campaign_name,
      start_date || new Date(),
      end_date || null,
      req.businessId,
      area || 'General',
      numBudget,
      parseFloat(daily_budget) || 0
    ]);

    const campaign = result.rows[0];

    // 5. Link Ads and set their budget & status
    if (Array.isArray(ad_ids) && ad_ids.length > 0) {
      for (let i = 0; i < ad_ids.length; i++) {
        await client.query(
          'INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, $3, 15) ON CONFLICT DO NOTHING',
          [campaign.id, ad_ids[i], i + 1]
        );
        await client.query(
          'UPDATE ads SET budget = $1, remaining_budget = $1, approval_status = $2 WHERE id = $3 AND advertiser_id = $4',
          [numBudget, 'Pending', ad_ids[i], req.businessId]
        );
      }
    }

    await client.query('COMMIT');

    const newOnHold = onHold + numBudget;
    const newActive = Math.max(0, totalBalance - newOnHold);

    res.json({
      success: true,
      campaign,
      wallet: {
        active_balance: newActive,
        on_hold: newOnHold,
        total_balance: totalBalance
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Business Create Campaign] Error:', error);
    res.status(500).json({ success: false, message: 'Could not create campaign: ' + error.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 5. ANALYTICS
// ==========================================

router.get('/analytics', businessAuth, async (req, res) => {
  try {
    const playsResult = await pool.query(`
      SELECT 
        DATE(pl.played_at) as date,
        COUNT(*) as plays,
        COALESCE(SUM(pl.duration * 0.35), 0) as spend
      FROM playback_logs pl
      JOIN ads a ON a.id = pl.ad_id
      WHERE a.advertiser_id = $1
      GROUP BY DATE(pl.played_at)
      ORDER BY DATE(pl.played_at) DESC
      LIMIT 30
    `, [req.businessId]);

    const totalRes = await pool.query(`
      SELECT COUNT(*) as total_plays, COALESCE(SUM(pl.duration * 0.35), 0) as total_spend
      FROM playback_logs pl
      JOIN ads a ON a.id = pl.ad_id
      WHERE a.advertiser_id = $1
    `, [req.businessId]);

    res.json({
      success: true,
      total_plays: parseInt(totalRes.rows[0].total_plays) || 0,
      total_spend: parseFloat(totalRes.rows[0].total_spend) || 0,
      daily_breakdown: playsResult.rows
    });
  } catch (error) {
    console.error('[Business Analytics] Error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch analytics' });
  }
});

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

router.get('/notifications', businessAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 7. WALLET & DIRECT TOP-UP
// ==========================================

router.get('/wallet', businessAuth, async (req, res) => {
  try {
    const txns = await pool.query(`
      SELECT * FROM wallet_transactions
      WHERE advertiser_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.businessId]);

    const biz = await pool.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [req.businessId]);
    const totalBalance = parseFloat(biz.rows[0]?.wallet_balance) || 0;

    const onHoldRes = await pool.query(`
      SELECT COALESCE(SUM(budget), 0) as on_hold 
      FROM campaigns 
      WHERE advertiser_id = $1 AND approval_status = 'Pending'
    `, [req.businessId]);
    const onHold = parseFloat(onHoldRes.rows[0]?.on_hold) || 0;
    const activeBalance = Math.max(0, totalBalance - onHold);

    const statsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END), 0) as total_added,
        COALESCE(SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END), 0) as total_spent
      FROM wallet_transactions
      WHERE advertiser_id = $1
    `, [req.businessId]);

    res.json({
      success: true,
      balance: totalBalance,
      wallet_balance: totalBalance,
      total_balance: totalBalance,
      on_hold: onHold,
      active_balance: activeBalance,
      total_added: parseFloat(statsRes.rows[0]?.total_added) || 0,
      total_spent: parseFloat(statsRes.rows[0]?.total_spent) || 0,
      transactions: txns.rows
    });
  } catch (error) {
    console.error('[Business Wallet] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/wallet/add-funds-direct', businessAuth, async (req, res) => {
  const { amount } = req.body;
  const numAmount = parseFloat(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE advertisers SET wallet_balance = wallet_balance + $1 WHERE id = $2',
      [numAmount, req.businessId]
    );
    await client.query(`
      INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, status)
      VALUES ($1, $2, 'Credit', 'Direct Wallet Recharge', 'SUCCESS')
    `, [req.businessId, numAmount]);

    await client.query('COMMIT');
    const biz = await client.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [req.businessId]);
    res.json({ success: true, message: 'Wallet credited successfully', wallet_balance: biz.rows[0].wallet_balance });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 8. WALLET — CASHFREE INTEGRATION
// ==========================================

const getCashfreeHeaders = () => ({
  'x-client-id': process.env.CASHFREE_CLIENT_ID,
  'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
  'x-api-version': '2023-08-01',
  'Content-Type': 'application/json',
});

const getCashfreeBaseUrl = () => {
  return process.env.CASHFREE_ENVIRONMENT === 'sandbox'
    ? 'https://sandbox.cashfree.com/pg'
    : 'https://api.cashfree.com/pg';
};

router.post('/wallet/create-order', businessAuth, async (req, res) => {
  const { amount } = req.body;
  const numAmount = parseFloat(amount);

  if (!numAmount || numAmount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum amount is ₹100' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const bizRes = await client.query('SELECT * FROM advertisers WHERE id = $1', [req.businessId]);
    if (bizRes.rows.length === 0) throw new Error('Business not found');
    const biz = bizRes.rows[0];

    const internalOrderId = `order_${Date.now()}_${req.businessId}_${Math.floor(Math.random() * 1000)}`;

    const response = await axios.post(`${getCashfreeBaseUrl()}/orders`, {
      order_id: internalOrderId,
      order_amount: numAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `biz_${biz.id}`,
        customer_name: biz.company_name || 'Business User',
        customer_email: biz.email || 'no-email@srads.com',
        customer_phone: biz.phone || '9999999999',
      },
      order_meta: {
        return_url: `https://dummy.return.url/verify?order_id={order_id}`
      },
      order_note: 'SRAds Wallet Top-up'
    }, { headers: getCashfreeHeaders() });

    const cashfreeOrder = response.data;

    await client.query(`
      INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, cashfree_order_id, cashfree_payment_session_id, status)
      VALUES ($1, $2, 'Credit', 'Cashfree Wallet Recharge', $3, $4, 'PENDING')
    `, [req.businessId, numAmount, internalOrderId, cashfreeOrder.payment_session_id]);

    const checkoutToken = jwt.sign(
      { order_id: internalOrderId, business_id: req.businessId },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30m' }
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      order_id: internalOrderId,
      payment_session_id: cashfreeOrder.payment_session_id,
      checkout_token: checkoutToken
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cashfree Create Order] Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not initialize payment: ' + (err.response?.data?.message || err.message) });
  } finally {
    client.release();
  }
});

router.get('/wallet/checkout/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    if (decoded.order_id !== orderId) {
      return res.status(403).send('Invalid checkout link.');
    }

    const txnRes = await pool.query('SELECT cashfree_payment_session_id FROM wallet_transactions WHERE cashfree_order_id = $1 AND advertiser_id = $2', [orderId, decoded.business_id]);
    if (txnRes.rows.length === 0) return res.status(404).send('Order not found.');

    const paymentSessionId = txnRes.rows[0].cashfree_payment_session_id;
    const isSandbox = process.env.CASHFREE_ENVIRONMENT === 'sandbox';
    const sdkUrl = 'https://sdk.cashfree.com/js/v3/cashfree.js';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>SRAds Secure Checkout</title>
          <script src="${sdkUrl}"></script>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #f59e0b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;}
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
      </head>
      <body>
          <div class="loader"></div>
          <p style="color: #64748b; font-weight: 600;">Initializing Secure Checkout...</p>
          <script>
              const cashfree = Cashfree({ mode: "${isSandbox ? 'sandbox' : 'production'}" });
              let checkoutOptions = {
                  paymentSessionId: "${paymentSessionId}",
                  redirectTarget: "_self"
              };
              cashfree.checkout(checkoutOptions).then((result) => {
                  if(result.error){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_FAILED', error: result.error.message }));
                  }
                  if(result.redirect){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_REDIRECT' }));
                  }
                  if(result.paymentDetails){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_SUCCESS' }));
                  }
              });
          </script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('[Cashfree Checkout Load] Error:', err.message);
    res.status(403).send('Link expired or invalid.');
  }
});

router.post('/wallet/verify-payment', businessAuth, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'Order ID required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const txnRes = await client.query(
      'SELECT * FROM wallet_transactions WHERE cashfree_order_id = $1 AND advertiser_id = $2 FOR UPDATE',
      [order_id, req.businessId]
    );

    if (txnRes.rows.length === 0) {
      throw new Error('Transaction not found or unauthorized');
    }

    const txn = txnRes.rows[0];

    if (txn.status === 'SUCCESS') {
      await client.query('ROLLBACK');
      const bizRes = await pool.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [req.businessId]);
      return res.json({ success: true, message: 'Payment already verified and credited', wallet_balance: bizRes.rows[0].wallet_balance });
    }

    const cfRes = await axios.get(`${getCashfreeBaseUrl()}/orders/${order_id}`, { headers: getCashfreeHeaders() });
    const orderData = cfRes.data;

    if (orderData.order_status === 'PAID') {
      const paidAmount = parseFloat(orderData.order_amount);
      await client.query('UPDATE advertisers SET wallet_balance = wallet_balance + $1 WHERE id = $2', [paidAmount, req.businessId]);
      await client.query("UPDATE wallet_transactions SET status = 'SUCCESS' WHERE id = $1", [txn.id]);
      await client.query('COMMIT');

      const bizRes = await pool.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [req.businessId]);
      return res.json({ success: true, message: 'Payment successful', wallet_balance: bizRes.rows[0].wallet_balance });
    } else {
      if (orderData.order_status === 'ACTIVE') {
        await client.query('COMMIT');
        return res.json({ success: false, status: 'PENDING', message: 'Payment is still pending' });
      }

      await client.query("UPDATE wallet_transactions SET status = 'FAILED' WHERE id = $1", [txn.id]);
      await client.query('COMMIT');
      return res.json({ success: false, status: 'FAILED', message: 'Payment failed or cancelled' });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cashfree Verify] Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
