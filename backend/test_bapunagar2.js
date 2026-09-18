require('dotenv').config();
const pool = require('./config/database');

async function checkDb() {
  console.log('--- ADVERTISERS ---');
  const advertisers = await pool.query('SELECT id, company_name, latitude, longitude FROM advertisers');
  console.table(advertisers.rows);

  console.log('--- CAMPAIGN_ADS ---');
  const campaignAds = await pool.query('SELECT * FROM campaign_ads');
  console.table(campaignAds.rows);

  console.log('--- MEDIA ---');
  const media = await pool.query('SELECT id, title, file_url FROM media');
  console.table(media.rows);

  process.exit(0);
}
checkDb();
