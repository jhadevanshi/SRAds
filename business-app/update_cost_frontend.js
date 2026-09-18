const fs = require('fs');
const path = 'src/screens/main/CreateCampaignScreen.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const RATE_PER_SECOND = 0\.02;/g, 'const RATE_PER_SECOND = 0.35;');
fs.writeFileSync(path, content);
console.log('Updated cost to 0.35 in CreateCampaignScreen');
