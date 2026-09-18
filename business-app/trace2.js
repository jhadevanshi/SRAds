const fs = require('fs');

const content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// Match all <View> and </View> tags and find the unbalanced one
const lines = content.split('\n');
const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Very simplistic parsing: replace <View /> to not count
  let parseLine = line.replace(/<View[^>]*\\/>/g, '');
  
  // Count opens and closes
  const opens = (parseLine.match(/<View(\\s|>)/g) || []).length;
  const closes = (parseLine.match(/<\\/View>/g) || []).length;
  
  for (let j = 0; j < opens; j++) stack.push(i + 1);
  for (let j = 0; j < closes; j++) {
    if (stack.length > 0) stack.pop();
    else console.log('Extra </View> at', i + 1);
  }
}

console.log('Unclosed tags opened at lines:', stack);
