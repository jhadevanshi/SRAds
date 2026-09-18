const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
pool.query(`
SELECT a.id, a.title, a.status, a.approval_status, a.budget, adv.company_name, adv.area, adv.latitude, adv.longitude
FROM ads a
JOIN advertisers adv ON a.advertiser_id = adv.id
`).then(res => { console.table(res.rows); pool.end(); });
