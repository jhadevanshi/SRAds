const fs = require('fs');

const path = 'src/player/AdPlayer.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import at the top
content = content.replace(
  "import { useApp } from '@/contexts/AppContext';",
  "import { useApp } from '@/contexts/AppContext';\nimport { deviceService } from '@/services/device';"
);

// Remove the inline require
content = content.replace(
  "const { deviceService } = require('@/services/device');",
  ""
);

fs.writeFileSync(path, content);
console.log('Fixed AdPlayer.tsx import properly');
