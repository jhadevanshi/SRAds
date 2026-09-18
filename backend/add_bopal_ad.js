const pool = require('./config/database');

async function addBopalAd() {
  try {
    console.log('--- Fetching existing image media ---');
    // Fetch a different image media if possible, or just the first one
    const mediaRes = await pool.query(`SELECT id FROM media WHERE media_type = 'image' ORDER BY id DESC LIMIT 1`);
    if (mediaRes.rows.length === 0) {
      console.log('No image media found!');
      return;
    }
    const mediaId = mediaRes.rows[0].id;
    console.log('Using media ID:', mediaId);

    // Create Advertiser for Bopal (approx 23.0333, 72.4667)
    const advRes = await pool.query(
      `INSERT INTO advertisers (company_name, owner_name, email, phone, area, address, city, state, business_type, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
       ['Bopal Cafe & Restro', 'Test User', 'bopal@example.com', '0987654321', 'Bopal', 'Bopal Cross Roads', 'Ahmedabad', 'Gujarat', 'Restaurant', 23.0333, 72.4667]
    );
    const advertiserId = advRes.rows[0].id;
    console.log('Created Bopal Advertiser ID:', advertiserId);

    // Create General Advertisement
    const adRes = await pool.query(
      `INSERT INTO ads (advertiser_id, title, ad_type, media_id, play_duration, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
       [advertiserId, 'Bopal Cafe Image Ad', 'GENERAL', mediaId, 15, 'Active']
    );
    console.log('Created Bopal General Advertisement ID:', adRes.rows[0].id);

    console.log('✅ Successfully added Ambli/Bopal ad!');
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    pool.end();
  }
}

addBopalAd();
