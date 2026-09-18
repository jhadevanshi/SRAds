const pool = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT * FROM wallet_transactions LIMIT 5
    `);
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
check();
