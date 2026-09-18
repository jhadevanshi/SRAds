const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT SUM(amount) as total_spend FROM playback_logs WHERE campaign_id = 9
    `);
    console.log('Total spend for camp 9:', res.rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
