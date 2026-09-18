const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');
code = code.replace("</View>\n        )}\n          </View>\n        )}", "</View>\n        )}");
fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Done');
