const fs = require('fs');

const path = 'src/player/AdPlayer.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { queuePlayback } from '@/services/offlineQueue';",
  "import deviceService from '@/services/device';"
);

const oldCode = `      queuePlayback(
        state.deviceInfo.id,
        adId,
        campaignId,
        actualDurationSeconds,
        sessionId
      ).catch(e => console.error('[AdPlayer] Failed to queue playback:', e));`;

const newCode = `      deviceService.logPlayback(state.deviceInfo.id, {
        campaignId,
        adId,
        duration: actualDurationSeconds,
        sessionId
      }).catch(e => console.error('[AdPlayer] Failed to log playback:', e));`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(path, content);
console.log('Fixed AdPlayer.tsx');
