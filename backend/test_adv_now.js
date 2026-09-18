require('dotenv').config();
const pool = require('./config/database');

async function fixDb() {
  const result = await pool.query('SELECT id, company_name FROM advertisers');
  console.table(result.rows);
  process.exit(0);
}
fixDb();
