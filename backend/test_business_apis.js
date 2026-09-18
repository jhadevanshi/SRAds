const https = require('http');

const data = JSON.stringify({ email: 'testbiz@example.com', password: 'password123' });
const opts = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/business/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = https.request(opts, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const parsed = JSON.parse(body);
    if (!parsed.success) { console.error('Login failed:', parsed.message); return; }
    const token = parsed.token;
    console.log('✅ Login OK — token:', token.substring(0, 30) + '...');

    // Test /profile endpoint
    const req2 = https.request({
      hostname: 'localhost', port: 5000,
      path: '/api/business/profile', method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res2) => {
      let b2 = '';
      res2.on('data', c => b2 += c);
      res2.on('end', () => {
        const p2 = JSON.parse(b2);
        console.log('✅ /profile:', p2.success ? `OK — ${p2.business.company_name}` : 'FAIL: ' + p2.message);
      });
    });
    req2.end();

    // Test /analytics endpoint
    const req3 = https.request({
      hostname: 'localhost', port: 5000,
      path: '/api/business/analytics', method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res3) => {
      let b3 = '';
      res3.on('data', c => b3 += c);
      res3.on('end', () => {
        const p3 = JSON.parse(b3);
        console.log('✅ /analytics:', p3.success ? `OK — total_plays=${p3.total_plays}, daily_breakdown days=${p3.daily_breakdown?.length}` : 'FAIL: ' + p3.message);
      });
    });
    req3.end();

    // Test /notifications endpoint
    const req4 = https.request({
      hostname: 'localhost', port: 5000,
      path: '/api/business/notifications', method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res4) => {
      let b4 = '';
      res4.on('data', c => b4 += c);
      res4.on('end', () => {
        const p4 = JSON.parse(b4);
        console.log('✅ /notifications:', p4.success ? `OK — ${p4.notifications?.length} notifications` : 'FAIL: ' + p4.message);
      });
    });
    req4.end();
  });
});
req.write(data);
req.end();
