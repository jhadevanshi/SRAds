const fs = require('fs');
const path = 'src/player/AdPlayer.tsx';

let content = fs.readFileSync(path, 'utf8');

// Update 0.02 to 0.35
content = content.replace(/\(elapsedSeconds \* 0\.02\)/g, '(elapsedSeconds * 0.35)');
content = content.replace(/\(Rate: ₹0\.02\/s\)/g, '(Rate: ₹0.35/s)');

// Update cover to contain for images and videos
content = content.replace(/contentFit="cover"/g, 'contentFit="contain"');
content = content.replace(/resizeMode="cover"/g, 'resizeMode="contain"');

fs.writeFileSync(path, content);
console.log('Fixed AdPlayer rate and crop modes!');
