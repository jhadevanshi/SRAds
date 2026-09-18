const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Register new admin user
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'Super Admin', 'Operator']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status',
      [name, email, password_hash, role, 'Active']
    );

    const user = result.rows[0];

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [user.id, 'User Registered', 'Authentication', `New user ${email} registered with role ${role}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('User found:', result.rows.length > 0);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    console.log('User status:', user.status);

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Verify password
    console.log('Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [user.id, 'Login', 'Authentication', 'User logged in', req.ip]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Logout (client-side token removal, but log the action)
router.post('/logout', auth, async (req, res) => {
  try {
    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Logout', 'Authentication', 'User logged out']
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;
