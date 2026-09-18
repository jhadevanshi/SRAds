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
    // Advertiser ID for Cafe Navrangpura is 2
    // Advertiser ID for Shivranjini Cafe is 3
    
    // Create General Ad for Cafe Navrangpura
    await client.query(`
      INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
      VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
    `, ['Krish Location - Navrangpura', 2, 6]);

    // Create General Ad for Shivranjini Cafe
    await client.query(`
      INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
      VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
    `, ['Krish Location - Shivranjini', 3, 6]);

    await client.query('COMMIT');
    console.log('Successfully created both general ads for the krish location media!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting ads:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
