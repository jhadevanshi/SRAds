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
      SELECT id, title FROM media WHERE title ILIKE '%gym%' LIMIT 1
    `);
    
    if (mediaRes.rows.length === 0) {
      console.log('Could not find media with title containing "gym"!');
      return;
    }
    
    const mediaId = mediaRes.rows[0].id;
    console.log(`Found Media ID: ${mediaId} (${mediaRes.rows[0].title})`);

    // Find advertiser ID
    let advRes = await client.query(`
      SELECT id, company_name FROM advertisers WHERE company_name ILIKE '%croma bapunagar%' LIMIT 1
    `);
    
    let advId;
    if (advRes.rows.length === 0) {
      console.log('Advertiser "croma bapunagar" not found. Creating it...');
      const insertAdv = await client.query(`
        INSERT INTO advertisers (company_name, owner_name, email, phone, wallet_balance, status)
        VALUES ($1, 'Croma Owner', 'croma.bapunagar@example.com', '7777777777', 500, 'Active')
        RETURNING id
      `, ['Croma Bapunagar']);
      advId = insertAdv.rows[0].id;
      console.log(`Created Advertiser 'Croma Bapunagar' with ID: ${advId}`);
    } else {
      advId = advRes.rows[0].id;
      console.log(`Found Advertiser ID: ${advId} (${advRes.rows[0].company_name})`);
    }

    // Insert Ad
    const adRes = await client.query(`
      INSERT INTO ads (title, advertiser_id, media_id, ad_type, status, approval_status, budget, remaining_budget, cost_per_play)
      VALUES ($1, $2, $3, 'GENERAL', 'Active', 'Approved', 100, 100, 1)
      RETURNING id
    `, ['Gym Ad - Croma Bapunagar General', advId, mediaId]);

    await client.query('COMMIT');
    console.log(`Successfully attached 'gym' media to Croma Bapunagar! (New Ad ID: ${adRes.rows[0].id})`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting ad:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
