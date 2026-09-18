const fs = require('fs');

const content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');
const lines = content.split('\n');

const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('//')) continue;
  if (line.trim().startsWith('{/*')) continue;

  const opens = (line.match(/<View(\s|>)/g) || []).length;
  const closes = (line.match(/<\/View>/g) || []).length;

  for (let j = 0; j < opens; j++) {
    stack.push(i + 1);
  }
  for (let j = 0; j < closes; j++) {
    if (stack.length > 0) {
      stack.pop();
    } else {
      console.log(\`Extra </View> found on line \${i + 1}\`);
    }
  }
}

if (stack.length > 0) {
  console.log("Unclosed <View> tags opened on lines:", stack);
} else {
  console.log("All <View> tags are balanced!");
}
