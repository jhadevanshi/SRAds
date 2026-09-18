require('dotenv').config();
const pool = require('./config/database');
const http = require('http');

async function brutalFixDb() {
  try {
    console.log('--- STARTING BRUTAL DB FIX ---');
    
    // 1. We know Advertiser ID is 5. Create a campaign for it in Bapunagar.
    const campRes = await pool.query(`
      INSERT INTO campaigns (campaign_name, start_date, end_date, advertiser_id, area, status)
      VALUES ('Bapunagar Coffee Promo', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 5, 'Bapunagar', 'Active')
      RETURNING id
    `);
    const newCampId = campRes.rows[0].id;
    console.log('Created Campaign ID:', newCampId);

    // 2. Set Ad ID 5 to CAMPAIGN
    await pool.query("UPDATE ads SET ad_type = 'CAMPAIGN' WHERE id = 5");
    console.log('Updated Ad ID 5 to CAMPAIGN');

    // 3. Link Ad 5 to Campaign newCampId
    await pool.query("INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, 5, 1, 15)", [newCampId]);
    console.log('Linked Ad 5 to Campaign', newCampId);

    console.log('--- DB FIXED, TESTING API ---');

    // 4. Test API
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/devices/4/status', // Using Suraj-002's current ID (4)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('API RESPONSE:', data);
        process.exit(0);
      });
    });
    
    req.on('error', e => {
      console.error('API Request Error:', e);
      process.exit(1);
    });

    req.write(JSON.stringify({ latitude: 23.02812400, longitude: 72.62083400 }));
    req.end();

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    process.exit(1);
  }
}
brutalFixDb();
