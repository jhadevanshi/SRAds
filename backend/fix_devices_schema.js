const pool = require('./config/database');

async function fix() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS installers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('installers table created or exists.');

    await pool.query(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS installer_id INTEGER REFERENCES installers(id) ON DELETE SET NULL;
    `);
    console.log('installer_id column added to devices.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
fix();
