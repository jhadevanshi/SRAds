require('dotenv').config();
const pool = require('./config/database');

async function updatePlaylist() {
  try {
    console.log('--- UPDATING BAPUNAGAR PLAYLIST ---');
    
    // In our DB right now: 
    // Bapunagar Campaign is ID 6
    // Navrangpura Ad (Video) is ID 7

    // 1. Unlink Ad 7 from the Navrangpura Campaign
    await pool.query('DELETE FROM campaign_ads WHERE ad_id = 7');
    console.log('Unlinked video ad from Navrangpura campaign');

    // 2. Link Ad 7 to Bapunagar Campaign (ID 6) as play_order = 2
    await pool.query('INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES (6, 7, 2, 15)');
    console.log('Linked video ad to Bapunagar Campaign with play_order 2');

    // 3. Move Nexus Tech Store (ID 7) to Bapunagar just in case (as requested by user)
    await pool.query(`
      UPDATE advertisers 
      SET address = 'Tech Park, Bapunagar', city = 'Ahmedabad', latitude = '23.031000', longitude = '72.623000'
      WHERE id = 7
    `);
    
    // Also move the Navrangpura Campaign (ID 7) to Bapunagar just in case
    await pool.query(`
      UPDATE campaigns
      SET campaign_name = 'Bapunagar Tech Sale', area = 'Bapunagar'
      WHERE id = 7
    `);
    console.log('Moved Nexus Tech Store to Bapunagar');

    // Let's verify the Bapunagar campaign playlist (Campaign 6)
    const playlist = await pool.query(`
      SELECT ca.play_order, a.title, a.ad_type, m.media_type
      FROM campaign_ads ca
      JOIN ads a ON ca.ad_id = a.id
      JOIN media m ON a.media_id = m.id
      WHERE ca.campaign_id = 6
      ORDER BY ca.play_order
    `);
    
    console.log('\\nCurrent Playlist for Bapunagar Campaign:');
    console.table(playlist.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error updating playlist:', error);
    process.exit(1);
  }
}

updatePlaylist();
