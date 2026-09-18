const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const sqlPath = path.join(__dirname, 'migrations', 'business_app_mvp.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Running migration: business_app_mvp.sql');
  
  try {
    await pool.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
