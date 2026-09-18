require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
pool.query("UPDATE campaigns SET approval_status = 'Approved', end_date = '2026-12-31' WHERE id=6;")
  .then(() => {
    console.log('Successfully approved and extended campaign 6!');
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
