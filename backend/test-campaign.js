const { Pool } = require('pg');
require('dotenv').config({ path: 'e:/SRAds/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const campRes = await client.query(
      `INSERT INTO campaigns (campaign_name, advertiser_id, start_date, end_date, budget, daily_budget, area, status, approval_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Inactive', 'Pending') RETURNING *`,
      ['Test Camp', 1, '2026-08-09', '2026-09-08', 0, 0, 'Paldi']
    );
    console.log('Campaign created:', campRes.rows[0]);
    const campaignId = campRes.rows[0].id;

    // find an ad
    const adRes = await client.query('SELECT id FROM ads WHERE advertiser_id = 1 LIMIT 1');
    if (adRes.rows.length > 0) {
      await client.query(
        `INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, $3, $4)`,
        [campaignId, adRes.rows[0].id, 1, 15]
      );
      console.log('Campaign Ad linked.');
    }
    
    await client.query('ROLLBACK');
    console.log('Test successful (rolled back).');
  } catch(e) {
    console.error('Error during insert:', e);
  } finally {
    client.release();
    pool.end();
  }
}
test();
