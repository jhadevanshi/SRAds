const pool = require('./config/database');

async function findAdvertiser() {
  try {
    const result = await pool.query('SELECT * FROM advertisers WHERE email = $1', ['suraj111@gmail.com']);
    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

findAdvertiser();
