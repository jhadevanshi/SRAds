const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    await pool.query("UPDATE advertisers SET password_hash = $1 WHERE email = 'test_new_register@example.com'", [hash]);
    console.log("Updated password to password123");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
