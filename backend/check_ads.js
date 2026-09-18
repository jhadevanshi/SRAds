const pool = require('./config/database');

async function run() {
  const res = await pool.query(`SELECT id, title, status, ad_type, approval_status FROM ads`);
  console.log('All Ads:');
  console.table(res.rows);
  pool.end();
}

run();
