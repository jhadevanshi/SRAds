require('dotenv').config();
const pool = require('./config/database');

async function checkMedia() {
  const result = await pool.query('SELECT * FROM media');
  console.table(result.rows);
  process.exit(0);
}
checkMedia();
