const pool = require('./config/database');

async function createIndexes() {
  try {
    console.log('Connecting to database...');
    // Test query
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully:', res.rows[0].now);

    console.log('Creating composite index on playback_logs...');
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_playback_logs_device_latest 
       ON playback_logs(device_id, played_at DESC, campaign_id)`
    );
    console.log('Composite index idx_playback_logs_device_latest created or already exists.');

    // We can also make sure other key indexes exist
    console.log('Creating index on devices(last_seen) to speed up active device count...');
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen)`
    );
    console.log('Index idx_devices_last_seen created or already exists.');

    console.log('Index optimization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating indexes:', err.message);
    process.exit(1);
  }
}

createIndexes();
