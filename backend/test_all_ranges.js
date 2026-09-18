const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'srads_db',
  password: 'D@sh#32a',
  port: 5432,
});

async function runTest(range) {
  try {
    const businessId = 1; // dummy business ID
    let dateFilter = '';
    
    switch (range) {
      case 'today':
        dateFilter = "pl.played_at >= CURRENT_DATE";
        break;
      case 'yesterday':
        dateFilter = "pl.played_at >= CURRENT_DATE - INTERVAL '1 day' AND pl.played_at < CURRENT_DATE";
        break;
      case '7d':
        dateFilter = "pl.played_at >= CURRENT_DATE - INTERVAL '6 days'";
        break;
      case '30d':
        dateFilter = "pl.played_at >= CURRENT_DATE - INTERVAL '29 days'";
        break;
      case 'month':
        dateFilter = "pl.played_at >= date_trunc('month', CURRENT_DATE)";
        break;
    }

    console.log(`\nTesting range: ${range} - ${dateFilter}`);
    
    await pool.query(`
      SELECT c.id, c.campaign_name as name, c.status, c.start_date, c.end_date,
        COUNT(pl.id) as plays,
        COALESCE(SUM(a.cost_per_play), 0) as spend,
        COUNT(DISTINCT pl.device_id) as active_displays
      FROM playback_logs pl
      JOIN ads a ON pl.ad_id = a.id
      JOIN campaigns c ON pl.campaign_id = c.id
      WHERE c.advertiser_id = $1 AND ${dateFilter}
      GROUP BY c.id
      ORDER BY plays DESC
    `, [businessId]);

    console.log(`Range ${range} passed.`);

  } catch (err) {
    console.error(`Range ${range} Failed:`, err.message);
  }
}

async function testAll() {
  await runTest('today');
  await runTest('yesterday');
  await runTest('7d');
  await runTest('30d');
  await runTest('month');
  await pool.end();
}

testAll();
