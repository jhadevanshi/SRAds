const pool = require('./config/database');

async function cleanOrphanedCampaigns() {
  try {
    const res = await pool.query('DELETE FROM campaigns WHERE id NOT IN (SELECT campaign_id FROM campaign_ads) RETURNING id');
    console.log(`Deleted ${res.rowCount} orphaned campaigns:`, res.rows.map(r => r.id));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

cleanOrphanedCampaigns();
