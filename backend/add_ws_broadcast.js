const fs = require('fs');

const path = 'routes/devices.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = "await client.query('COMMIT');\\n    res.json({ success: true, message: 'Playback logged and wallet deducted' });";
const replacementStr = "await client.query('COMMIT');\\n    try {\\n      const { broadcastToAdvertiser } = require('../services/websocket');\\n      broadcastToAdvertiser(advertiserId, { type: 'AD_PLAYBACK', adId, campaignId: safeCampaignId, cost });\\n    } catch(err) { console.error('WS Error:', err.message); }\\n    res.json({ success: true, message: 'Playback logged and wallet deducted' });";

// Using regex or exact string replacement
content = content.replace(/await client\.query\('COMMIT'\);\s*res\.json\(\{ success: true, message: 'Playback logged and wallet deducted' \}\);/g, "await client.query('COMMIT');\n    try {\n      const { broadcastToAdvertiser } = require('../services/websocket');\n      broadcastToAdvertiser(advertiserId, { type: 'AD_PLAYBACK', adId, campaignId: safeCampaignId, cost });\n    } catch(err) { console.error('WS Error:', err.message); }\n    res.json({ success: true, message: 'Playback logged and wallet deducted' });");

fs.writeFileSync(path, content);
console.log('Added websocket broadcast to /playback endpoint');
