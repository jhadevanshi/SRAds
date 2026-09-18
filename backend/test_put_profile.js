require('dotenv').config();
const pool = require('./config/database');

async function testQuery() {
  try {
    const driverId = 2; // From the screenshot
    const phone = '1234567893';
    const finalEmail = 'test@example.com';
    const name = 'Suraj Mehata';

    let checkQuery = 'SELECT id FROM drivers WHERE (phone = $1 OR email = $2) AND id != $3';
    let checkParams = [phone, finalEmail, driverId];
    
    console.log("Running checkQuery...");
    const checkUser = await pool.query(checkQuery, checkParams);
    console.log("CheckUser Result:", checkUser.rows);

    console.log("Running updateQuery...");
    await pool.query(
      'UPDATE drivers SET name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [name, phone, finalEmail, driverId]
    );
    console.log("Update successful!");

  } catch (err) {
    console.error("Test Query failed:", err);
  } finally {
    process.exit(0);
  }
}

testQuery();
