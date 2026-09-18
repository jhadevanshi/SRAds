require('dotenv').config();
const pool = require('./config/database');

async function getDevices() {
  const result = await pool.query('SELECT id, adsd_id, device_name, status FROM devices');
  console.table(result.rows);
  process.exit(0);
}
getDevices();
