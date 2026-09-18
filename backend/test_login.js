const http = require('http');

const data = JSON.stringify({ adsdId: 'suraj-3' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/devices/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
