const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
pool.query('SELECT company_name, area, latitude, longitude FROM advertisers').then(res => { console.table(res.rows); pool.end(); });
