require('dotenv').config();
const pool = require('./config/database');

async function test() {
  const ads = await pool.query('SELECT id, title, ad_type, status FROM ads');
  console.log('--- ADS ---');
  console.table(ads.rows);

  const campaigns = await pool.query('SELECT id, campaign_name, status, start_date, end_date FROM campaigns');
  console.log('--- CAMPAIGNS ---');
  console.table(campaigns.rows);
  
  process.exit(0);
}
test();
