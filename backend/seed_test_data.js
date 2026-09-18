require('dotenv').config();
const pool = require('./config/database');

async function seedData() {
  try {
    console.log('--- STARTING DATABASE SEED ---');

    // 1. Clear existing data (cascade will handle child tables if foreign keys are set up correctly, but let's do it manually just in case)
    await pool.query('DELETE FROM campaign_ads');
    await pool.query('DELETE FROM ads');
    await pool.query('DELETE FROM campaigns');
    await pool.query('DELETE FROM advertisers');
    console.log('Cleared existing advertisers, campaigns, and ads.');

    // 2. Create Realistic Advertiser for Bapunagar
    const bapunagarAdv = await pool.query(`
      INSERT INTO advertisers (company_name, owner_name, email, phone, address, area, city, latitude, longitude, status)
      VALUES (
        'The Coffee Bean - Bapunagar', 'Rahul Sharma', 'rahul@coffeebean.in', '+919876543210', 
        'Shop 15, Diamond Hub', 'Bapunagar', 'Ahmedabad', '23.029500', '72.622000', 'Active'
      ) RETURNING id
    `);
    const bapAdvId = bapunagarAdv.rows[0].id;
    console.log('Created Bapunagar Advertiser:', bapAdvId);

    // 3. Create Realistic Advertiser for Navrangpura
    const navrangpuraAdv = await pool.query(`
      INSERT INTO advertisers (company_name, owner_name, email, phone, address, area, city, latitude, longitude, status)
      VALUES (
        'Nexus Tech Store', 'Priya Patel', 'priya@nexustech.in', '+919876543211', 
        'Ground Floor, CG Road', 'Navrangpura', 'Ahmedabad', '23.036000', '72.561100', 'Active'
      ) RETURNING id
    `);
    const navAdvId = navrangpuraAdv.rows[0].id;
    console.log('Created Navrangpura Advertiser:', navAdvId);

    // 4. Create Bapunagar Campaign
    const bapCamp = await pool.query(`
      INSERT INTO campaigns (campaign_name, start_date, end_date, advertiser_id, area, status)
      VALUES (
        'Bapunagar Monsoon Coffee Offer', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 
        $1, 'Bapunagar', 'Active'
      ) RETURNING id
    `, [bapAdvId]);
    const bapCampId = bapCamp.rows[0].id;
    console.log('Created Bapunagar Campaign:', bapCampId);

    // 5. Create Navrangpura Campaign
    const navCamp = await pool.query(`
      INSERT INTO campaigns (campaign_name, start_date, end_date, advertiser_id, area, status)
      VALUES (
        'CG Road Tech Clearance', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 
        $1, 'Navrangpura', 'Active'
      ) RETURNING id
    `, [navAdvId]);
    const navCampId = navCamp.rows[0].id;
    console.log('Created Navrangpura Campaign:', navCampId);

    // 6. Create Ad for Bapunagar (Using Media 6 - image)
    const bapAd = await pool.query(`
      INSERT INTO ads (title, description, advertiser_id, media_id, ad_type, play_duration, status)
      VALUES (
        'Buy 1 Get 1 Free Coffee', 'Special monsoon offer for Bapunagar locals', $1, 6, 'CAMPAIGN', 15, 'Active'
      ) RETURNING id
    `, [bapAdvId]);
    const bapAdId = bapAd.rows[0].id;
    
    // 7. Create Ad for Navrangpura (Using Media 8 - video)
    const navAd = await pool.query(`
      INSERT INTO ads (title, description, advertiser_id, media_id, ad_type, play_duration, status)
      VALUES (
        'Laptops at 40% Off', 'Massive tech clearance sale', $1, 8, 'CAMPAIGN', 15, 'Active'
      ) RETURNING id
    `, [navAdvId]);
    const navAdId = navAd.rows[0].id;

    // 8. Link Ads to Campaigns
    await pool.query('INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, 1, 15)', [bapCampId, bapAdId]);
    console.log('Linked Bapunagar Ad to Bapunagar Campaign');
    
    await pool.query('INSERT INTO campaign_ads (campaign_id, ad_id, play_order, duration) VALUES ($1, $2, 1, 15)', [navCampId, navAdId]);
    console.log('Linked Navrangpura Ad to Navrangpura Campaign');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);

  } catch (error) {
    console.error('CRITICAL ERROR DURING SEED:', error);
    process.exit(1);
  }
}

seedData();
