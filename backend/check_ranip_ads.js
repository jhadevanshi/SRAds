const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, title, ad_type, status, approval_status, remaining_budget 
      FROM ads 
      WHERE title LIKE '%New Ranip%'
    `);
    
    let allActive = true;
    for (const ad of res.rows) {
      if (ad.status !== 'Active' || ad.approval_status !== 'Approved' || ad.ad_type !== 'GENERAL' || ad.remaining_budget <= 0) {
        allActive = false;
        
        // Fix it if it's not active
        await client.query(`
          UPDATE ads 
          SET status = 'Active', approval_status = 'Approved', ad_type = 'GENERAL', remaining_budget = GREATEST(remaining_budget, 100)
          WHERE id = $1
        `, [ad.id]);
        console.log(`Fixed ad ID ${ad.id} to be Active/Approved/GENERAL with budget.`);
      }
    }
    
    if (allActive) {
      console.log('All New Ranip ads are already perfectly ACTIVE and GENERAL!');
    }
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
