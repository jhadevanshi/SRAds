const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'playback_logs'
    `);
    console.log('playback_logs nullable:', res.rows.map(r => `${r.column_name}: ${r.is_nullable}`).join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
