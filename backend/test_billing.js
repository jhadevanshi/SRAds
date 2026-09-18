const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runTest() {
  const client = await pool.connect();
  let testAdvId = null;
  let testAdId = null;
  try {
    console.log('--- Starting Billing MVP Verification ---');
    await client.query("DELETE FROM advertisers WHERE email = 'testbiz@test.com'");
    
    // 1. Create advertiser
    const advRes = await client.query(
      `INSERT INTO advertisers (company_name, owner_name, email, wallet_balance, status) 
       VALUES ('Test Biz', 'Owner', 'testbiz@test.com', 10, 'Active') RETURNING id`
    );
    testAdvId = advRes.rows[0].id;
    console.log('1. Created advertiser with Wallet: ₹10');

    // 2. Create ad with Budget ₹2
    const adRes = await client.query(
      `INSERT INTO ads (title, advertiser_id, ad_type, budget, remaining_budget, cost_per_play, approval_status, status) 
       VALUES ('Test Ad', $1, 'GENERAL', 2, 2, 1, 'Approved', 'Active') RETURNING id`,
      [testAdvId]
    );
    testAdId = adRes.rows[0].id;
    console.log('2. Created ad with Budget: ₹2, Cost/Play: ₹1');

    // 3. Simulate Playback 1 (Mocking the route logic)
    await simulatePlayback(client, testAdId);
    console.log('3. Simulated Playback 1');
    
    let adState = await client.query('SELECT remaining_budget, status, approval_status FROM ads WHERE id = $1', [testAdId]);
    let bizState = await client.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [testAdvId]);
    console.log(`   State -> Wallet: ₹${bizState.rows[0].wallet_balance}, Remaining Budget: ₹${adState.rows[0].remaining_budget}, Status: ${adState.rows[0].status}`);
    
    // 4. Simulate Playback 2 (Should exhaust budget)
    await simulatePlayback(client, testAdId);
    console.log('4. Simulated Playback 2');
    
    adState = await client.query('SELECT remaining_budget, status, approval_status FROM ads WHERE id = $1', [testAdId]);
    bizState = await client.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [testAdvId]);
    console.log(`   State -> Wallet: ₹${bizState.rows[0].wallet_balance}, Remaining Budget: ₹${adState.rows[0].remaining_budget}, Status: ${adState.rows[0].status}, Approval: ${adState.rows[0].approval_status}`);
    
    if (adState.rows[0].status === 'Inactive' && adState.rows[0].approval_status === 'Budget Exhausted') {
      console.log('✅ Billing logic verified! Auto-pause works.');
    } else {
      console.error('❌ Billing logic failed. Ad should be Budget Exhausted.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Cleanup
    if (testAdvId) {
      await client.query('DELETE FROM advertisers WHERE id = $1', [testAdvId]);
      console.log('Cleaned up test data.');
    }
    client.release();
    pool.end();
  }
}

async function simulatePlayback(client, adId) {
  await client.query('BEGIN');
  const adRes = await client.query('SELECT advertiser_id, cost_per_play, budget, remaining_budget FROM ads WHERE id = $1', [adId]);
  const ad = adRes.rows[0];
  if (ad.budget > 0) {
    const cost = Number(ad.cost_per_play);
    await client.query(
      `UPDATE ads SET remaining_budget = GREATEST(0, remaining_budget - $1), total_plays = total_plays + 1, total_spend = total_spend + $1 WHERE id = $2`,
      [cost, adId]
    );
    await client.query(
      `UPDATE advertisers SET wallet_balance = GREATEST(0, wallet_balance - $1) WHERE id = $2`,
      [cost, ad.advertiser_id]
    );
    const checkRes = await client.query('SELECT remaining_budget FROM ads WHERE id = $1', [adId]);
    if (checkRes.rows[0].remaining_budget <= 0) {
      await client.query(`UPDATE ads SET status = 'Inactive', approval_status = 'Budget Exhausted' WHERE id = $1`, [adId]);
    }
  }
  await client.query('COMMIT');
}

runTest();
