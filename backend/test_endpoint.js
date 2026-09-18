const pool = require('./config/database');

async function check() {
  const client = await pool.connect();
  try {
    const campaignId = 9;
    const adId = 10;
    const duration = 15;
    const deviceId = 1;

    await client.query('BEGIN');

    const campRes = await client.query('SELECT advertiser_id FROM campaigns WHERE id = $1', [campaignId]);
    const advertiserId = campRes.rows[0].advertiser_id;

    const cost = parseFloat((duration * 0.02).toFixed(2));

    await client.query(
      `INSERT INTO playback_logs (device_id, campaign_id, ad_id, duration, amount, played_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [deviceId, campaignId, adId, duration, cost]
    );

    await client.query(
      `INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, status) 
       VALUES ($1, $2, 'Debit', $3, 'SUCCESS')`,
      [advertiserId, cost, `Playback deduction for Ad ID: ${adId}`]
    );

    await client.query(
      `UPDATE advertisers SET wallet_balance = wallet_balance - $1 WHERE id = $2`,
      [cost, advertiserId]
    );

    await client.query('ROLLBACK'); // rollback so we don't pollute
    console.log('Success!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}
check();
