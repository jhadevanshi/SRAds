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
    const newPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query("UPDATE advertisers SET password_hash = $1 WHERE email = 'suraj11@gmail.com'", [hash]);
    console.log('Password successfully reset to:', newPassword);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
