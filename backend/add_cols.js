require('dotenv').config();
const pool = require('./config/database.js');
async function run() {
  try {
    await pool.query("ALTER TABLE campaigns ADD COLUMN start_time TIME DEFAULT '00:00:00', ADD COLUMN end_time TIME DEFAULT '23:59:59';");
    console.log('Columns added to campaigns.');
  } catch(e) {
    console.error('Error (campaigns):', e.message);
  }
  
  try {
    await pool.query("ALTER TABLE ads ADD COLUMN video_trim_start INTEGER DEFAULT 0, ADD COLUMN video_trim_end INTEGER DEFAULT 0;");
    console.log('Columns added to ads.');
  } catch(e) {
    console.error('Error (ads):', e.message);
  }
  process.exit(0);
}
run();
