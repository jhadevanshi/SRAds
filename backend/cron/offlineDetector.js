const pool = require('../config/database');

function startOfflineDetector() {
  console.log('[Cron] Starting Offline Detector (runs every 60 seconds)...');
  
  setInterval(async () => {
    try {
      // Find devices where heartbeat_at is older than 3 minutes and status is still 'Online'
      // Or last_seen is older than 3 minutes and status is 'Online' (fallback)
      const result = await pool.query(`
        UPDATE devices 
        SET status = 'Offline', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'Online' 
        AND (
          (heartbeat_at IS NOT NULL AND NOW() - heartbeat_at > interval '3 minutes')
          OR 
          (heartbeat_at IS NULL AND last_seen IS NOT NULL AND NOW() - last_seen > interval '3 minutes')
        )
        RETURNING id, device_name;
      `);

      if (result.rows.length > 0) {
        console.log(`[Cron] Marked ${result.rows.length} device(s) as Offline due to inactivity:`);
        result.rows.forEach(r => console.log(`  - Device: ${r.device_name} (ID: ${r.id})`));
      }
    } catch (error) {
      console.error('[Cron] Error running Offline Detector:', error.message);
    }
  }, 60000); // Run every 1 minute
}

module.exports = startOfflineDetector;
