require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
(async () => {
  const advRes = await pool.query(`SELECT played_at FROM playback_logs pl JOIN ads a ON pl.ad_id = a.id WHERE a.advertiser_id = 2 ORDER BY played_at DESC LIMIT 5;`);
  console.log('Recent Plays for Adv 2:', advRes.rows);
  pool.end();
})();
