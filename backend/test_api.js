const axios = require('axios');

async function test() {
  try {
    // First we need to login to get a token
    const login = await axios.post('http://localhost:5000/api/business/login', {
      email: 'disha@srads.com', // assuming this exists, let's just use token if I can't login
      password: 'password123'
    });
  } catch(e) {
    console.error(e.message);
  }
}
