const pool = require('../config/database');

/**
 * Insert an admin activity log entry.
 * This is intentionally non-blocking — a logging failure must never
 * cause the parent request to return 500.
 *
 * @param {number|null} adminId  - ID of the acting user (from req.user.id)
 * @param {string}      action   - Short action label, e.g. 'Advertiser Created'
 * @param {string}      module   - Module name, e.g. 'Advertisers'
 * @param {string}      [description] - Human-readable description
 * @param {string}      [ipAddress]   - Request IP address
 */
async function adminLog(adminId, action, module, description = '', ipAddress = null) {
  try {
    if (ipAddress) {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description, ip_address) VALUES ($1, $2, $3, $4, $5)',
        [adminId, action, module, description, ipAddress]
      );
    } else {
      await pool.query(
        'INSERT INTO admin_logs (admin_id, action, module, description) VALUES ($1, $2, $3, $4)',
        [adminId, action, module, description]
      );
    }
  } catch (err) {
    // Log to console but never propagate — the calling operation already succeeded
    console.error(`[adminLog] Failed to write log (admin_id=${adminId}): ${err.message}`);
  }
}

module.exports = adminLog;
