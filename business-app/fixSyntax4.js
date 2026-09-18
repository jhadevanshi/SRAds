const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

code = code.replace(/<\/View>[\r\n\s]*\)}[\r\n\s]*<\/View>[\r\n\s]*\)}/, '</View>\n        )}');

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Fixed duplicate tag');
