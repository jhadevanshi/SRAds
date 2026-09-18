const pool = require('./config/database');

async function mockPlays() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const adId = 20;
    const campId = 16;
    const advertiserId = 4;
    
    // Simulate 45 plays for today
    for(let i=0; i<45; i++) {
      const cost = 0.60; // 30s * 0.02
      await client.query(
        \`INSERT INTO playback_logs (device_id, campaign_id, ad_id, duration, amount, played_at) 
         VALUES (1, $1, $2, 30, $3, CURRENT_TIMESTAMP)\`,
        [campId, adId, cost]
      );
      
      await client.query(
        \`INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, status) 
         VALUES ($1, $2, 'Debit', 'Simulated playback deduction', 'SUCCESS')\`,
        [advertiserId, cost]
      );
      
      await client.query(
        \`UPDATE advertisers SET wallet_balance = wallet_balance - $1 WHERE id = $2\`,
        [cost, advertiserId]
      );
      
      await client.query(\`
        UPDATE ads 
        SET total_plays = total_plays + 1, total_spend = total_spend + $1
        WHERE id = $2
      \`, [cost, adId]);
    }
    
    await client.query('COMMIT');
    console.log('Successfully mocked 45 plays for Ad 20!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

mockPlays();
