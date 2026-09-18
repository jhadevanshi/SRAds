const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find media ID
    const mediaRes = await client.query(`
      SELECT id, title FROM media WHERE title ILIKE '%suraj_test_again%' LIMIT 1
    `);
    
    if (mediaRes.rows.length === 0) {
      console.log('Could not find media with title suraj_test_again!');
      return;
    }
    
    const mediaId = mediaRes.rows[0].id;
    console.log(`Found Media ID: ${mediaId} (${mediaRes.rows[0].title})`);

    // Advertiser ID for Bopal Cafe & Restro is 4
    const advId = 4;

    // Insert Ad
    const adRes = await client.query(`
      INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
      VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
      RETURNING id
    `, ['Suraj Test Again - Bopal Cafe General', advId, mediaId]);

    await client.query('COMMIT');
    console.log(`Successfully attached 'suraj_test_again' to Bopal Cafe and Restro! (New Ad ID: ${adRes.rows[0].id})`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting ad:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
