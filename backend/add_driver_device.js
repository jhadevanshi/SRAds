const pool = require('./config/database');

async function addDriver() {
  try {
    const deviceId = 5; // The one we successfully created

    // 2. Create a Driver
    console.log('--- Creating Driver ---');
    const driverRes = await pool.query(
      `INSERT INTO drivers (name, phone, password_hash, vehicle_type, vehicle_number, status, device_id)
       VALUES ($1, $2, $3, $4, $5, 'Active', $6) RETURNING id`,
      ['Test Driver', '9876543211', 'dummy_hash', 'Auto', 'GJ01AB1234', deviceId]
    );
    console.log(`✅ Created Driver ID: ${driverRes.rows[0].id}`);

    console.log('All done!');
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    pool.end();
  }
}

addDriver();
