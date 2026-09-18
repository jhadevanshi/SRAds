const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

// Get all media
router.get('/', auth, async (req, res) => {
  try {
    const { media_type } = req.query;
    let query = 'SELECT m.*, u.name as uploaded_by_name FROM media m LEFT JOIN users u ON m.uploaded_by = u.id WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (media_type) {
      paramCount++;
      query += ` AND m.media_type = $${paramCount}`;
      params.push(media_type);
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      media: result.rows
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single media
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.name as uploaded_by_name FROM media m LEFT JOIN users u ON m.uploaded_by = u.id WHERE m.id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      media: result.rows[0]
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Upload media
router.post('/', adminAuth, upload.single('file'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('media_type').isIn(['image', 'video']).withMessage('Invalid media type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, media_type, duration } = req.body;

    // Validate file extension matches media_type
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (media_type === 'image' && !IMAGE_EXTS.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `File type "${ext}" does not match media type "image". Allowed: ${IMAGE_EXTS.join(', ')}`
      });
    }
    if (media_type === 'video' && !VIDEO_EXTS.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `File type "${ext}" does not match media type "video". Allowed: ${VIDEO_EXTS.join(', ')}`
      });
    }

    const file_url = `/uploads/${req.file.filename}`;
    const resolution = '1920x1080'; // Default, can be extracted from file
    const size = req.file.size;

    const result = await pool.query(
      'INSERT INTO media (title, file_name, file_url, media_type, duration, resolution, size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, req.file.originalname, file_url, media_type, duration || null, resolution, size, req.user.id]
    );

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Media Uploaded', 'Media', `Uploaded media: ${title}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      media: result.rows[0]
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete media
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM media WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    // Log the action (non-blocking)
    try {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Media Deleted', 'Media', `Deleted media: ${result.rows[0].title}`]
      );
    } catch (logErr) { console.error('Admin log insertion failed:', logErr.message); }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
