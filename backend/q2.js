const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool();

async function run() {
  try {
    const res = await pool.query("SELECT id, campaign_name, budget, status FROM campaigns WHERE campaign_name ILIKE '%hello disha%'");
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
