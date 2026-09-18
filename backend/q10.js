const pool = require('./config/database');

async function check() {
  try {
    const cRes = await pool.query(`
      SELECT c.id, c.budget,
        COALESCE((SELECT SUM(amount) FROM playback_logs WHERE campaign_id = c.id), 0) as total_spend
      FROM campaigns c
    `);
    console.log(cRes.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
