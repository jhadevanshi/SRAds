const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const drv = await client.query('SELECT * FROM drivers LIMIT 1');
    const dev = await client.query('SELECT * FROM devices LIMIT 1');
    console.log('Driver cols:', Object.keys(drv.rows[0] || {}));
    console.log('Device cols:', Object.keys(dev.rows[0] || {}));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
