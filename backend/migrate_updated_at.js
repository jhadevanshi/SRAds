require('dotenv').config();
const pool = require('./config/database');

async function fixTable() {
  try {
    await pool.query(`
      ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

fixTable();
