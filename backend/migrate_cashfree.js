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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if columns exist
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' AND column_name IN ('cashfree_order_id', 'cashfree_payment_session_id', 'status');
    `);
    
    const existingCols = res.rows.map(r => r.column_name);
    
    let query = 'ALTER TABLE wallet_transactions ';
    let adds = [];
    
    if (!existingCols.includes('cashfree_order_id')) {
      adds.push('ADD COLUMN cashfree_order_id VARCHAR(255) UNIQUE');
    }
    if (!existingCols.includes('cashfree_payment_session_id')) {
      adds.push('ADD COLUMN cashfree_payment_session_id VARCHAR(255)');
    }
    if (!existingCols.includes('status')) {
      adds.push("ADD COLUMN status VARCHAR(50) DEFAULT 'SUCCESS'");
    }
    
    if (adds.length > 0) {
      query += adds.join(', ');
      await client.query(query);
      console.log('Successfully added columns:', adds);
    } else {
      console.log('Columns already exist.');
    }
    
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
