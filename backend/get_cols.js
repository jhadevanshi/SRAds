const pool = require('./config/database');

pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'playback_logs'").then(res => {
  console.log(res.rows.map(r => r.column_name));
  pool.end();
});
