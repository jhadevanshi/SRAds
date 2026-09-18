require('dotenv').config();
const pool = require('./config/database');

async function test() {
  const currentDeviceRes = await pool.query('SELECT * FROM devices WHERE id = $1', [2]);
  console.log('Query result:', currentDeviceRes.rows);
  
  const allDevices = await pool.query('SELECT id, adsd_id FROM devices');
  console.log('All devices:', allDevices.rows);
  process.exit(0);
}
test();
