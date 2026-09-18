const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const lines = code.split('\\n');
let i = 0;
while (i < lines.length - 3) {
  if (lines[i].includes('</View>') && 
      lines[i+1].includes(')}') && 
      lines[i+2].includes('</View>') && 
      lines[i+3].includes(')}')) {
    // found duplicate
    lines.splice(i+2, 2);
    break;
  }
  i++;
}

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', lines.join('\\n'));
console.log('Fixed syntax error via line splice');
