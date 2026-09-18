const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

content = content.replace(/const cost = parseFloat\(\(duration \* 0\.02\)\.toFixed\(2\)\);/g, 'const cost = parseFloat((duration * 0.35).toFixed(2));');
content = content.replace(/\/\/ Cost calculation: 0\.02 per second/g, '// Cost calculation: 0.35 per second');

fs.writeFileSync('routes/devices.js', content);
console.log('Updated cost to 0.35 in backend devices.js');
