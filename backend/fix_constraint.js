const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE ads DROP CONSTRAINT ads_approval_status_check;`);
    await client.query(`ALTER TABLE ads ADD CONSTRAINT ads_approval_status_check CHECK (approval_status IN ('Pending', 'Approved', 'Rejected', 'Budget Exhausted'));`);
    console.log('Constraint updated successfully');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
