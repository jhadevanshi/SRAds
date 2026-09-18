const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Media ID for "krish location" is 6
    // Advertiser ID for "Bopal Cafe & Restro" is 4
    
    // Create General Ad for Bopal Cafe & Restro
    await client.query(`
      INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
      VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
    `, ['Krish Location - Bopal Cafe General', 4, 6]);

    await client.query('COMMIT');
    console.log('Successfully added krish location media to general ads of Bopal Cafe and Restro!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting ads:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
