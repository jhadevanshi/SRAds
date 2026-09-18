const pool = require('./config/database');

async function seedDefaultAd() {
  try {
    const advRes = await pool.query('SELECT id FROM advertisers LIMIT 1');
    const advId = advRes.rows[0].id;

    const mediaRes = await pool.query(
      `INSERT INTO media (advertiser_id, title, file_name, file_url, media_type, duration) 
       VALUES ($1, 'SRAds Default Media', 'srads_default.png', '/uploads/default_srads.png', 'image', 15) RETURNING id`,
      [advId]
    );
    const mediaId = mediaRes.rows[0].id;

    await pool.query(
      `INSERT INTO ads (advertiser_id, title, media_id, ad_type, category, play_duration, status, approval_status, approved_at) 
       VALUES ($1, 'SRAds Welcome', $2, 'GENERAL', 'System', 15, 'Active', 'Approved', CURRENT_TIMESTAMP)`,
      [advId, mediaId]
    );

    console.log('Successfully seeded default GENERAL ad for advertiser', advId);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

seedDefaultAd();
