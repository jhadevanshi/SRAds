require('dotenv').config();
const axios = require('axios');

async function testCashfree() {
  const getCashfreeHeaders = () => ({
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json',
  });

  const getCashfreeBaseUrl = () => {
    return process.env.CASHFREE_ENVIRONMENT === 'sandbox' 
      ? 'https://sandbox.cashfree.com/pg' 
      : 'https://api.cashfree.com/pg';
  };

  try {
    const response = await axios.post(`${getCashfreeBaseUrl()}/orders`, {
      order_id: `test_${Date.now()}`,
      order_amount: 500,
      order_currency: 'INR',
      customer_details: {
        customer_id: `biz_1`,
        customer_name: 'Test Business',
        customer_email: 'test@example.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: `https://dummy.return.url/verify?order_id={order_id}`
      },
      order_note: 'SRAds Wallet Top-up'
    }, { headers: getCashfreeHeaders() });

    console.log('Success:', response.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testCashfree();
