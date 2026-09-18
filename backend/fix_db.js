require('dotenv').config();
const pool = require('./config/database');
const http = require('http');

async function fixDb() {
  try {
    // 1. Convert ad 5 from GENERAL to CAMPAIGN
    await pool.query("UPDATE ads SET ad_type = 'CAMPAIGN' WHERE id = 5");
    console.log('Updated ad ID 5 to CAMPAIGN type.');

    // 2. Clear campaign_ads to be safe, then insert link
    await pool.query("DELETE FROM campaign_ads WHERE campaign_id = 2");
    await pool.query("INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES (2, 5, 1, 15)");
    console.log('Linked Ad ID 5 to Campaign ID 2 in campaign_ads table.');

    // 3. Test the API route for device 4 (suraj-002)
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/devices/4/status',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('API RESPONSE STATUS:', res.statusCode);
        console.log('API RESPONSE BODY:', data);
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
    console.error('Error fixing DB:', error);
    process.exit(1);
  }
}

fixDb();
