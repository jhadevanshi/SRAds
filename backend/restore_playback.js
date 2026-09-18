const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

const newEndpoint = `
// Log ad playback & deduct wallet balance
router.post('/:id/playback', async (req, res) => {
  const pool = require('../config/database');
  const client = await pool.connect();
  try {
    const { campaignId, adId, duration, sessionId } = req.body;
    const deviceId = req.params.id;

    if (!adId || !duration) {
      return res.status(400).json({ success: false, message: 'Missing playback data' });
    }

    await client.query('BEGIN');

    // 1. Get the advertiser ID for this AD
    const adRes = await client.query('SELECT advertiser_id FROM ads WHERE id = $1', [adId]);
    if (adRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    const advertiserId = adRes.rows[0].advertiser_id;

    // Parse campaign_id safely
    const safeCampaignId = (campaignId && campaignId !== 'general' && campaignId !== 'none') ? parseInt(campaignId) : null;

    // Cost calculation: 0.02 per second
    const cost = parseFloat((duration * 0.02).toFixed(2));

    // 2. Insert into playback_logs WITH AMOUNT
    await client.query(
      \`INSERT INTO playback_logs (device_id, campaign_id, ad_id, duration, playback_session_id, amount, played_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)\`,
      [deviceId, safeCampaignId, adId, duration, sessionId || null, cost]
    );

    // 3. Deduct from wallet transactions
    await client.query(
      \`INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, status) 
       VALUES ($1, $2, 'Debit', $3, 'SUCCESS')\`,
      [advertiserId, cost, \`Playback deduction for Ad ID: \${adId}\`]
    );

    // 4. Update the advertiser's total wallet balance
    await client.query(
      \`UPDATE advertisers SET wallet_balance = wallet_balance - $1 WHERE id = $2\`,
      [cost, advertiserId]
    );

    // Also update ads.total_plays counter:
    await client.query(\`
      UPDATE ads 
      SET 
        total_plays = total_plays + 1,
        total_spend = total_spend + $1
      WHERE id = $2
    \`, [cost, adId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Playback logged and wallet deducted' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Playback] Error logging playback:', error);
    res.status(500).json({ success: false, message: 'Failed to log playback', error: error.message, stack: error.stack });
  } finally {
    client.release();
  }
});
`;

content = content.replace('module.exports = router;', newEndpoint + '\nmodule.exports = router;');
fs.writeFileSync('routes/devices.js', content);
console.log('Restored playback endpoint');
