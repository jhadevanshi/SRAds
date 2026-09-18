const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool();

async function check() {
  const res = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('wallet_transactions', 'playback_logs', 'ads', 'campaigns')
  `);
  console.log(res.rows);
}

check().catch(console.error).finally(() => pool.end());
