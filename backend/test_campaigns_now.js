require('dotenv').config();
const pool = require('./config/database');

async function getCampaigns() {
  const result = await pool.query('SELECT id, campaign_name FROM campaigns');
  console.table(result.rows);
  process.exit(0);
}
getCampaigns();
