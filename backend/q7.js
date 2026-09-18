const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT * FROM playback_logs WHERE campaign_id = 9
    `);
    console.log('playback_logs for camp 9:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
