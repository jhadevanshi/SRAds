const pool = require('./config/database');

async function run() {
  const client = await pool.connect();
  try {
    // 1. Check wallet_transactions columns
    const cols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'wallet_transactions' ORDER BY ordinal_position
    `);
    console.log('wallet_transactions columns:');
    cols.rows.forEach(c => console.log(' -', c.column_name, ':', c.data_type));

    // 2. Check if gst and address exist on advertisers
    const advCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'advertisers' AND column_name IN ('gst','address','owner_name','phone')
    `);
    console.log('\nadvertisers optional columns found:', advCols.rows.map(r => r.column_name));

    // 3. Check if business_notifications table exists
    const notifCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'business_notifications'
      ) AS exists
    `);
    console.log('\nbusiness_notifications table exists:', notifCheck.rows[0].exists);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}
run();
