require('dotenv').config();
const pool = require('./config/database');

async function checkDb() {
  console.log('--- DEVICES ---');
  const devices = await pool.query('SELECT id, adsd_id, device_name, status, latitude, longitude FROM devices WHERE adsd_id ILIKE $1 OR device_name ILIKE $1', ['%suraj%']);
  if (devices.rows.length === 0) {
    const allDevices = await pool.query('SELECT id, adsd_id, device_name, status, latitude, longitude FROM devices');
    console.table(allDevices.rows);
  } else {
    console.table(devices.rows);
  }

  console.log('--- CAMPAIGNS ---');
  const campaigns = await pool.query('SELECT id, campaign_name, status, start_date, end_date, advertiser_id, area FROM campaigns');
  console.table(campaigns.rows);

  console.log('--- ADVERTISERS ---');
  const advertisers = await pool.query('SELECT id, company_name, area, city, latitude, longitude FROM advertisers');
  console.table(advertisers.rows);

  console.log('--- CAMPAIGN_ADS ---');
  const campaignAds = await pool.query('SELECT * FROM campaign_ads');
  console.table(campaignAds.rows);

  process.exit(0);
}
checkDb();
