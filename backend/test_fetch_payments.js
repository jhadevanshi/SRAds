require('dotenv').config();
const axios = require('axios');

async function testFetchPayments() {
  const getCashfreeHeaders = () => ({
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
    'x-api-version': '2025-01-01',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const getCashfreeBaseUrl = () => {
    return process.env.CASHFREE_ENVIRONMENT === 'sandbox' 
      ? 'https://sandbox.cashfree.com/pg' 
      : 'https://api.cashfree.com/pg';
  };

  const orderId = 'test_1786784107195'; // Replace with a valid order_id if needed
  try {
    const response = await axios.get(`${getCashfreeBaseUrl()}/orders/${orderId}/payments`, { 
      headers: getCashfreeHeaders() 
    });
    console.log('Payments Response:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error fetching payments:', err.response?.data || err.message);
  }
}

testFetchPayments();
