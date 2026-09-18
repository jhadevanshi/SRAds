const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create new advertiser for New Ranip
    const advRes = await client.query(`
      INSERT INTO advertisers (company_name, owner_name, email, phone, wallet_balance, status)
      VALUES ($1, 'Ranip Owner', 'ranipcafe@example.com', '9999999999', 500, 'Active')
      RETURNING id
    `, ['New Ranip Cafe']);
    const advId = advRes.rows[0].id;

    // Get an image media and a video media
    const imgRes = await client.query(`SELECT id, title FROM media WHERE media_type = 'image' LIMIT 1`);
    const vidRes = await client.query(`SELECT id, title FROM media WHERE media_type = 'video' LIMIT 1`);
    
    const imgId = imgRes.rows.length > 0 ? imgRes.rows[0].id : null;
    const vidId = vidRes.rows.length > 0 ? vidRes.rows[0].id : null;

    if (imgId) {
      await client.query(`
        INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
        VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
      `, ['New Ranip General Image Ad', advId, imgId]);
      console.log('Attached Image Ad using media:', imgRes.rows[0].title);
    }

    if (vidId) {
      await client.query(`
        INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
        VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
      `, ['New Ranip General Video Ad', advId, vidId]);
      console.log('Attached Video Ad using media:', vidRes.rows[0].title);
    }

    await client.query('COMMIT');
    console.log(`Created Advertiser 'New Ranip Cafe' with ID: ${advId}`);
    console.log('Successfully inserted data for New Ranip Area testing!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting ads:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
