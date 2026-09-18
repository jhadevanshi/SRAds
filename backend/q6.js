const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT id, campaign_name, budget, status, advertiser_id
      FROM campaigns 
    `);
    console.log('campaigns:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
