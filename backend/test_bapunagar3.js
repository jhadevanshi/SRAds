require('dotenv').config();
const pool = require('./config/database');

// Haversine distance calculator
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function checkDb() {
  console.log('--- DEVICE SURAJ-002 ---');
  const devices = await pool.query("SELECT id, adsd_id, latitude, longitude FROM devices WHERE adsd_id ILIKE '%suraj-002%'");
  console.table(devices.rows);

  if (devices.rows.length === 0) {
    console.log('Device not found in DB!');
    process.exit(1);
  }
  
  const devLat = Number(devices.rows[0].latitude);
  const devLng = Number(devices.rows[0].longitude);

  console.log('\n--- ACTIVE CAMPAIGNS ---');
  const campaigns = await pool.query(`
    SELECT c.id, c.campaign_name, c.area, a.company_name, a.latitude as adv_lat, a.longitude as adv_long 
    FROM campaigns c
    LEFT JOIN advertisers a ON c.advertiser_id = a.id
    WHERE c.status = 'Active' AND c.start_date <= CURRENT_DATE AND c.end_date >= CURRENT_DATE
  `);
  
  const campaignsWithDist = campaigns.rows.map(c => {
    const dist = getDistance(devLat, devLng, Number(c.adv_lat), Number(c.adv_long));
    return { ...c, distance_km: dist.toFixed(2), within_1km: dist <= 1 };
  });
  console.table(campaignsWithDist);

  console.log('\n--- CAMPAIGN ADS FOR CAMPAIGN 1 ---');
  const campaignAds = await pool.query('SELECT * FROM campaign_ads WHERE campaign_id = 1');
  console.table(campaignAds.rows);
  
  console.log('\n--- ALL CAMPAIGN ADS ---');
  const allCampaignAds = await pool.query('SELECT * FROM campaign_ads');
  console.table(allCampaignAds.rows);

  process.exit(0);
}
checkDb();
