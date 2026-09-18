require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function migrate() {
  try {
    await pool.query('BEGIN');
    
    // Add columns if they do not exist
    await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR'`);
    await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS cashfree_payment_id VARCHAR(255)`);
    await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`);
    await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    
    // Add unique constraint on cashfree_order_id if not exists
    const checkRes = await pool.query(`
      SELECT conname FROM pg_constraint 
      WHERE conrelid = 'wallet_transactions'::regclass 
      AND conname = 'wallet_transactions_cashfree_order_id_key'
    `);
    
    if (checkRes.rows.length === 0) {
      // Data might have null or duplicates if not careful, but this is a fresh setup.
      await pool.query(`ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_cashfree_order_id_key UNIQUE (cashfree_order_id)`);
    }
    
    await pool.query('COMMIT');
    console.log("Migration successful.");
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
