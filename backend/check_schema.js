const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  try {
    const res = await pool.query("SELECT * FROM users LIMIT 1");
    console.log(res.rows[0]);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
