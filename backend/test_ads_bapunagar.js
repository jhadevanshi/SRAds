require('dotenv').config();
const pool = require('./config/database');

async function checkAds() {
  const ads = await pool.query('SELECT id, title, ad_type, status FROM ads');
  console.table(ads.rows);
  process.exit(0);
}
checkAds();
