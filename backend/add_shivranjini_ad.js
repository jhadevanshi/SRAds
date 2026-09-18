const pool = require('./config/database');

async function addShivranjiniAd() {
  try {
    console.log('--- Fetching existing image media ---');
    const mediaRes = await pool.query(`SELECT id FROM media WHERE media_type = 'image' LIMIT 1`);
    if (mediaRes.rows.length === 0) {
      console.log('No image media found!');
      return;
    }
    const mediaId = mediaRes.rows[0].id;
    console.log('Using media ID:', mediaId);

    // Advertiser for Shivranjini already created with ID 3 (from previous run)
    // Create General Advertisement
    const adRes = await pool.query(
      `INSERT INTO ads (advertiser_id, title, ad_type, media_id, play_duration, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
       [3, 'Shivranjini Cafe Image Ad', 'GENERAL', mediaId, 15, 'Active']
    );
    console.log('Created Shivranjini General Advertisement ID:', adRes.rows[0].id);

    console.log('✅ Successfully added Shivranjini ad!');
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    pool.end();
  }
}

addShivranjiniAd();
