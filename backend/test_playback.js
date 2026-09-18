const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/devices/1/playback', {
      campaignId: 9,
      adId: 10,
      duration: 15
    });
    console.log('Success:', res.data);
  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}
test();
