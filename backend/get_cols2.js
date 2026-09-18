const pool = require('./config/database');

async function getCols() {
  const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'playback_logs'`);
  console.log(result.rows.map(r => r.column_name));
  pool.end();
}
getCols();
