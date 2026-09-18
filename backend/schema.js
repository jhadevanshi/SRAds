require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'advertisers';")
  .then(res => {
    console.table(res.rows);
    return pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transactions';");
  })
  .then(res => {
    console.log('Transactions table:');
    if (res.rows.length) console.table(res.rows); else console.log('No transactions table found.');
    return pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  })
  .then(res => {
    console.log('All tables:');
    console.table(res.rows);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
