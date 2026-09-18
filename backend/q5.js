const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, campaign_name, budget, status, advertiser_id
      FROM campaigns 
      WHERE campaign_name ILIKE '%hello disha%'
    `);
    console.log('campaign:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
