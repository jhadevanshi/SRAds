const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query("SELECT pg_get_constraintdef((SELECT oid FROM pg_constraint WHERE conname = 'advertisers_status_check'))");
    console.log(res.rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
