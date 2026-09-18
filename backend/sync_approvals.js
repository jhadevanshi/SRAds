const pool = require('./config/database');

async function syncApprovals() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Approve campaigns where the ad is approved
    const appRes = await client.query(`
      UPDATE campaigns c
      SET approval_status = 'Approved', status = 'Active'
      FROM campaign_ads ca
      JOIN ads a ON ca.ad_id = a.id
      WHERE c.id = ca.campaign_id AND a.approval_status = 'Approved' AND c.approval_status != 'Approved'
    `);
    console.log(`Auto-approved ${appRes.rowCount} campaigns.`);

    // Reject campaigns where the ad is rejected
    const rejRes = await client.query(`
      UPDATE campaigns c
      SET approval_status = 'Rejected', status = 'Inactive'
      FROM campaign_ads ca
      JOIN ads a ON ca.ad_id = a.id
      WHERE c.id = ca.campaign_id AND a.approval_status = 'Rejected' AND c.approval_status != 'Rejected'
    `);
    console.log(`Auto-rejected ${rejRes.rowCount} campaigns.`);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

syncApprovals();
