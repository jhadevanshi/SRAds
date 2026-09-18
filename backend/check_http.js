const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/business/register', {
      company_name: 'Test Co API',
      owner_name: 'Test Owner API',
      email: 'api_test@example.com',
      phone: '1234567890',
      password: 'password123',
      confirm_password: 'password123'
    });
    console.log("Success:", res.data);
  } catch(e) {
    if (e.response) {
      console.error("Error Response Data:", e.response.data);
    } else {
      console.error("Network Error:", e.message);
    }
  }
}
run();
