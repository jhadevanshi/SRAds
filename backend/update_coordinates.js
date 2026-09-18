const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // The provided coordinates: 23°04'60.0″N 72°33'37.9"E
    // Converting to decimal degrees:
    // Latitude: 23 + 4/60 + 60/3600 = 23.083333
    // Longitude: 72 + 33/60 + 37.9/3600 = 72.560527
    
    const lat = 23.083333;
    const lon = 72.560527;

    const res = await client.query(`
      UPDATE advertisers 
      SET latitude = $1, 
          longitude = $2, 
          city = 'Ahmedabad', 
          state = 'Gujarat', 
          address = 'New Ranip, Ahmedabad, Gujarat'
      WHERE id IN (8, 9)
      RETURNING id, company_name, latitude, longitude, city, state
    `, [lat, lon]);

    await client.query('COMMIT');
    console.log('Successfully updated coordinates for New Ranip advertisers!');
    console.log(res.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating coordinates:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
