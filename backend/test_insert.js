const pool = require('./config/database');
async function test() {
  try {
    await pool.query(`
      ALTER TABLE ads 
      ADD COLUMN IF NOT EXISTS approved_by INTEGER,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);
    console.log('Successfully added columns to ads table');
  } catch (err) {
    console.error('Error adding columns:', err);
  }
  pool.end();
}
test();
