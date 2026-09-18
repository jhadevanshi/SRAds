const pool = require('./config/database');

async function update() {
  try {
    const res = await pool.query(
      'UPDATE advertisers SET latitude = $1, longitude = $2 WHERE id = 1 RETURNING *',
      [23.0282592, 72.6204759]
    );
    console.log('Updated:', res.rows[0].area, res.rows[0].latitude, res.rows[0].longitude);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
update();
