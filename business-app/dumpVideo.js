const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');
const searchString = "{newAdMedia.type === 'video' && (";
const startIdx = code.indexOf(searchString);
if (startIdx !== -1) {
    console.log(code.substring(startIdx, startIdx + 1500));
}
