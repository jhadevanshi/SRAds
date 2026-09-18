const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert Device
    const devRes = await client.query(`
      INSERT INTO devices (adsd_id, serial_number, device_name, vehicle_type, vehicle_number, status)
      VALUES ($1, $2, $3, $4, $5, 'Offline')
      RETURNING id
    `, ['dikshant-1', 'SN-DIKSHANT-001', 'Dikshant Device', 'Auto', 'GJ01-DK-1111']);
    
    const deviceId = devRes.rows[0].id;

    // Insert Driver
    const drvRes = await client.query(`
      INSERT INTO drivers (name, phone, password_hash, vehicle_type, vehicle_number, status, device_id)
      VALUES ($1, $2, 'dummy_hash', $3, $4, 'Active', $5)
      RETURNING id
    `, ['dikshant', '8888888888', 'Auto', 'GJ01-DK-1111', deviceId]);

    await client.query('COMMIT');
    console.log(`Successfully added Driver 'dikshant' (ID: ${drvRes.rows[0].id}) and Device 'dikshant-1' (ID: ${deviceId})!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting driver:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
