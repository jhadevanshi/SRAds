const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const adv = await client.query('SELECT id, company_name FROM advertisers');
    console.log('Advertisers:', adv.rows);

    const media = await client.query('SELECT id, title FROM media ORDER BY id DESC LIMIT 5');
    console.log('Recent Media:', media.rows);

    const campaigns = await client.query('SELECT id, name, advertiser_id, target_area FROM campaigns');
    console.log('Campaigns:', campaigns.rows);

    const ads = await client.query('SELECT id, title, advertiser_id, ad_type, status FROM ads ORDER BY id DESC LIMIT 5');
    console.log('Recent Ads:', ads.rows);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
