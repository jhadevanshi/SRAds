const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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
    const res = await pool.query("SELECT password_hash FROM advertisers WHERE email = 'suraj11@gmail.com'");
    console.log('Hash:', res.rows[0].password_hash);
    
    const isMatch = await bcrypt.compare('Password123!', res.rows[0].password_hash);
    console.log('Match Test:', isMatch);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
