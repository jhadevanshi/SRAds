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
    const res = await pool.query("SELECT * FROM advertisers WHERE email = 'suraj11@gmail.com'");
    console.log('Advertisers:', res.rows);
    
    // Check if driver table exists and query it
    try {
      const res2 = await pool.query("SELECT * FROM driver WHERE email = 'suraj11@gmail.com'");
      console.log('Drivers:', res2.rows);
    } catch (e) {
      // ignore table not found
    }
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
