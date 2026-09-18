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
    
    // Check if user exists
    const check = await pool.query("SELECT id FROM users WHERE email = 'suraj11@gmail.com'");
    
    if (check.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)", 
        ['Suraj (Admin)', 'suraj11@gmail.com', hash, 'Admin', 'Active']
      );
      console.log('Admin user created successfully.');
    } else {
      await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'suraj11@gmail.com'", [hash]);
      console.log('Admin password updated successfully.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
