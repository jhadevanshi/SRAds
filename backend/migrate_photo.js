require('dotenv').config();
const pool = require('./config/database');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE drivers ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255);
    `);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
