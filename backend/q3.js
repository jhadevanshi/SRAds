const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'playback_logs'
    `);
    console.log('playback_logs columns:', res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
