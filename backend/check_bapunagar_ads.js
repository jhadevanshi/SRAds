const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    // Let's find advertisers matching 'bapunagar'
    const advRes = await client.query(`
      SELECT id, company_name FROM advertisers WHERE company_name ILIKE '%bapunagar%'
    `);
    console.log('Bapunagar Advertisers:', advRes.rows);
    
    if (advRes.rows.length > 0) {
      const advIds = advRes.rows.map(a => a.id);
      
      // Let's find ads for these advertisers
      const adsRes = await client.query(`
        SELECT id, title, ad_type, status, approval_status, budget, remaining_budget 
        FROM ads 
        WHERE advertiser_id = ANY($1)
      `, [advIds]);
      
      console.log('Bapunagar Ads:', adsRes.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
