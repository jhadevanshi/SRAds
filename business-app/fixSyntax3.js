const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// Use a regex to find two consecutive closing views.
code = code.replace(/<\/View>\s*}\)\s*<\/View>\s*}\)/, '</View>\n        )}');

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Fixed duplicate tag');
