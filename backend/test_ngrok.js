const http = require('https');

const req = http.request({
  hostname: 'last-obliged-pureness.ngrok-free.dev',
  path: '/api/devices/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('DATA:', data.substring(0, 200)));
});

req.on('error', error => console.error(error));
req.write(JSON.stringify({ adsdId: 'suraj-3' }));
req.end();
