const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get all installers
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM installers WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      installers: result.rows
    });
  } catch (error) {
    console.error('Get installers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single installer
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM installers WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    res.json({
      success: true,
      installer: result.rows[0]
    });
  } catch (error) {
    console.error('Get installer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create installer
router.post('/', adminAuth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, city, state } = req.body;

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM installers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Installer with this email already exists'
      });
    }

    const result = await pool.query(
      'INSERT INTO installers (name, email, phone, city, state) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, city, state]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Installer Created', 'Installers', `Created installer: ${name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Installer created successfully',
      installer: result.rows[0]
    });
  } catch (error) {
    console.error('Create installer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update installer
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, city, state } = req.body;

    // Check if installer exists
    const existing = await pool.query(
      'SELECT * FROM installers WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== existing.rows[0].email) {
      const emailConflict = await pool.query(
        'SELECT id FROM installers WHERE email = $1 AND id != $2',
        [email, req.params.id]
      );

      if (emailConflict.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another installer'
        });
      }
    }

    const result = await pool.query(
      'UPDATE installers SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), city = COALESCE($4, city), state = COALESCE($5, state) WHERE id = $6 RETURNING *',
      [name, email, phone, city, state, req.params.id]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Installer Updated', 'Installers', `Updated installer: ${result.rows[0].name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Installer updated successfully',
      installer: result.rows[0]
    });
  } catch (error) {
    console.error('Update installer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete installer
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM installers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Installer Deleted', 'Installers', `Deleted installer: ${result.rows[0].name}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Installer deleted successfully'
    });
  } catch (error) {
    console.error('Delete installer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
