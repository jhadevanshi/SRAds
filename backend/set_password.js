const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const email = 'testbiz@example.com';
    const plainPassword = 'password123';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);
    
    // Check if testbiz exists, if not create it
    let res = await client.query('SELECT id FROM advertisers WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO advertisers (company_name, owner_name, email, phone, wallet_balance, status, password_hash)
        VALUES ('Test Business', 'Test Owner', $1, '9999999999', 500, 'Active', $2)
      `, [email, hash]);
      console.log('Created testbiz@example.com account!');
    } else {
      await client.query(`
        UPDATE advertisers SET password_hash = $2 WHERE email = $1
      `, [email, hash]);
      console.log('Updated testbiz@example.com password!');
    }
    
    console.log('You can now log in with:');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
