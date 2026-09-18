require('dotenv').config();
const pool = require('./config/database');

async function seedDevice() {
  try {
    const bapunagarDevice = await pool.query(`
      INSERT INTO devices (adsd_id, device_name, vehicle_type, status, latitude, longitude)
      VALUES (
        'suraj-002', 'Bapunagar Auto', 'Auto', 'Online', '23.028124', '72.620834'
      ) RETURNING id
    `);
    console.log('Created Device with AdsD ID: suraj-002');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL ERROR DURING DEVICE SEED:', error);
    process.exit(1);
  }
}

seedDevice();
