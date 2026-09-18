const fs = require('fs');

const content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// A very naive JSX tag balancer for <View> and </View>
const lines = content.split('\n');
let viewCount = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Count un-commented occurrences of <View and </View>
  // Exclude lines with '//' or '{/*' (naive but often works)
  if (!line.trim().startsWith('//')) {
    const opens = (line.match(/<View(\s|>)/g) || []).length;
    const closes = (line.match(/<\/View>/g) || []).length;
    
    viewCount += opens;
    viewCount -= closes;
  }
}

console.log("Net <View> count (positive means missing closing tag):", viewCount);
