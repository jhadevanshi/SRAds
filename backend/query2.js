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
    const res = await pool.query("SELECT * FROM users WHERE email = 'suraj11@gmail.com'");
    console.log('Users:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
