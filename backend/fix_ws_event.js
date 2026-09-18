const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

content = content.replace(/{ type: 'AD_PLAYBACK'/g, "{ type: 'AD_PLAYBACK_COMPLETED'");

fs.writeFileSync('routes/devices.js', content);
console.log('Fixed websocket event name');
