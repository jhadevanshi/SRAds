require('dotenv').config();
const pool = require('./config/database');

async function fixDb() {
  try {
    // 1. Create a new campaign for Shake Maker
    const insertCampaign = await pool.query(`
      INSERT INTO campaigns (campaign_name, description, start_date, end_date, advertiser_id, area, status)
      VALUES ('Bapunagar Coffee Promo', 'Auto created for testing', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 1, 'Bapunagar', 'Active')
      RETURNING id
    `);
    const newCampId = insertCampaign.rows[0].id;
    console.log('Created new campaign ID:', newCampId);

    // 2. Convert ad 5 to CAMPAIGN type just to be proper
    await pool.query("UPDATE ads SET ad_type = 'CAMPAIGN' WHERE id = 5");
    console.log('Updated Ad 5 to CAMPAIGN type.');

    // 3. Link Ad 5 to the new Campaign
    await pool.query("INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, 5, 1, 15)", [newCampId]);
    console.log('Linked Ad 5 to Campaign', newCampId);

    console.log('Database fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing DB:', error);
    process.exit(1);
  }
}
fixDb();
