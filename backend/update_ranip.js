const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update advertisers
    const advUpdate = await client.query(`
      UPDATE advertisers 
      SET company_name = REPLACE(company_name, 'Ranip', 'New Ranip')
      WHERE (id = 8 OR id = 9) AND company_name NOT LIKE '%New Ranip%'
      RETURNING id, company_name
    `);
    
    // Update ads
    const adsUpdate = await client.query(`
      UPDATE ads 
      SET title = REPLACE(title, 'Ranip', 'New Ranip')
      WHERE (advertiser_id = 8 OR advertiser_id = 9) AND title NOT LIKE '%New Ranip%'
      RETURNING id, title
    `);

    await client.query('COMMIT');
    console.log('Successfully reverted area names from "Ranip" back to "New Ranip"!');
    console.log('Updated Advertisers:', advUpdate.rows);
    console.log('Updated Ads:', adsUpdate.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating records:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
