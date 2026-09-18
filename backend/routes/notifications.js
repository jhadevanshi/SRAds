const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      notifications: result.rows
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get unread notifications count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE status = 'Unread'"
    );

    res.json({
      success: true,
      unread_count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create notification
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('type').isIn(['Info', 'Warning', 'Error', 'Success']).withMessage('Invalid type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, message, type } = req.body;

    const result = await pool.query(
      'INSERT INTO notifications (title, message, type, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, message, type, 'Unread']
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE notifications SET status = 'Read' WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET status = 'Read' WHERE status = 'Unread'"
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete notification
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
