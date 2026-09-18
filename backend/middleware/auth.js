const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the user still exists in the database.
    // This catches stale tokens whose user was deleted or the DB was reset.
    let userQuery = '';
    
    if (decoded.role === 'Driver') {
      userQuery = 'SELECT id, name, phone as email, status FROM drivers WHERE id = $1';
    } else {
      userQuery = 'SELECT id, name, email, role, status FROM users WHERE id = $1';
    }

    const result = await pool.query(userQuery, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please log in again.'
      });
    }

    const user = result.rows[0];

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    req.user = { ...user, role: decoded.role || user.role };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. Please log in again.'
      });
    }
    // Unexpected errors (e.g. DB down) — don't leak internals
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
