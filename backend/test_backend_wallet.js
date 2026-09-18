require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function testBackend() {
  console.log('--- Starting Backend Test ---');
  let client;
  try {
    client = await pool.connect();
    
    // Find a valid business
    const res = await client.query("SELECT * FROM advertisers LIMIT 1");
    if (res.rows.length === 0) {
      console.log('No business found to test with.');
      return;
    }
    
    const biz = res.rows[0];
    console.log(`Testing with Business ID: ${biz.id}, Phone: ${biz.phone}`);

    if (!biz.phone || !/^\d{10}$/.test(biz.phone.trim())) {
      console.log('WARNING: This business does not have a valid 10-digit phone number. Expecting a 400 error from backend.');
    }

    // Generate token
    const token = jwt.sign({ id: biz.id, role: 'Business' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Hit the local API
    console.log('\nMaking POST request to /api/business/wallet/create-order...');
    const response = await axios.post('http://localhost:5000/api/business/wallet/create-order', {
      amount: 500
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n--- SUCCESS ---');
    console.log(response.data);

  } catch (err) {
    console.log('\n--- ERROR RECEIVED ---');
    console.log('Status:', err.response?.status);
    console.log('Data:', JSON.stringify(err.response?.data, null, 2));
    console.log('Message:', err.message);
  } finally {
    if (client) client.release();
    pool.end();
  }
}

testBackend();
