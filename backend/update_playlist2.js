require('dotenv').config();
const pool = require('./config/database');

async function fix() {
  const ads = await pool.query("SELECT id, title FROM ads WHERE title ILIKE '%Laptop%'");
  const videoAdId = ads.rows[0].id;

  const campaigns = await pool.query("SELECT id FROM campaigns WHERE campaign_name ILIKE '%Bapunagar Monsoon%'");
  const bapunagarCampId = campaigns.rows[0].id;

  await pool.query('DELETE FROM campaign_ads WHERE ad_id = $1', [videoAdId]);
  await pool.query('INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, 2, 15)', [bapunagarCampId, videoAdId]);
  
  const playlist = await pool.query(`
    SELECT ca.play_order, a.title, m.media_type
    FROM campaign_ads ca
    JOIN ads a ON ca.ad_id = a.id
    JOIN media m ON a.media_id = m.id
    WHERE ca.campaign_id = $1
    ORDER BY ca.play_order
  `, [bapunagarCampId]);
  
  console.log('Playlist:', playlist.rows);
  process.exit(0);
}
fix();
