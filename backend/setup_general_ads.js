const pool = require('./config/database');

async function run() {
  try {
    console.log('--- Wiping Campaigns & Campaign Ads ---');
    await pool.query('DELETE FROM campaign_devices');
    await pool.query('DELETE FROM campaign_ads');
    await pool.query('DELETE FROM campaigns');
    
    console.log('--- Wiping Existing Ads ---');
    await pool.query('DELETE FROM ads');

    console.log('--- Seeding Location-Aware General Ads ---');
    
    // Bapunagar General Ads (Advertiser 1)
    await pool.query(`
      INSERT INTO ads (title, advertiser_id, media_id, category, ad_type, play_duration, status)
      VALUES 
      ('Bapunagar General Video', 1, 1, 'General', 'GENERAL', 15, 'Active'),
      ('Bapunagar General Image', 1, 3, 'General', 'GENERAL', 15, 'Active')
    `);

    // Navrangpura General Ads (Advertiser 2)
    await pool.query(`
      INSERT INTO ads (title, advertiser_id, media_id, category, ad_type, play_duration, status)
      VALUES 
      ('Navrangpura General Image', 2, 4, 'General', 'GENERAL', 15, 'Active'),
      ('Navrangpura General Video', 2, 5, 'General', 'GENERAL', 15, 'Active')
    `);

    console.log('✅ Successfully seeded General Ads linked to Bapunagar and Navrangpura advertisers.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

run();
