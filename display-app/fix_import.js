const fs = require('fs');

const path = 'src/player/AdPlayer.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import deviceService from '@/services/device';",
  "import { deviceService } from '@/services/device';"
);

fs.writeFileSync(path, content);
console.log('Fixed import in AdPlayer.tsx');
