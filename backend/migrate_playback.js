const pool = require('./config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS playback_logs (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE,
          device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
          campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          area VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_playback_logs_ad_id ON playback_logs(ad_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_playback_logs_played_at ON playback_logs(played_at);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_playback_logs_campaign_id ON playback_logs(campaign_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_playback_logs_device_id ON playback_logs(device_id);`);

    await client.query(`
      ALTER TABLE ads 
        ADD COLUMN IF NOT EXISTS total_plays INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_spend DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS remaining_budget DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS budget DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cost_per_play DECIMAL(15,2) DEFAULT 0.02,
        ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'Pending',
        ADD COLUMN IF NOT EXISTS media_id INTEGER REFERENCES media(id) ON DELETE SET NULL;
    `);

    await client.query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS area VARCHAR(255);`);
    await client.query(`ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(15,2) DEFAULT 0;`);

    await client.query('COMMIT');
    console.log('Migration successful');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}
migrate();
