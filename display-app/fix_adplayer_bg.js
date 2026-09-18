const fs = require('fs');
const path = 'src/player/AdPlayer.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace <View style={StyleSheet.absoluteFill}> with one that has background color
content = content.replace(
  '<View style={StyleSheet.absoluteFill}>',
  '<View style={[StyleSheet.absoluteFill, { backgroundColor: \\'#000000\\' }]}>'
);

fs.writeFileSync(path, content);
console.log('Added black background to AdPlayer container');
