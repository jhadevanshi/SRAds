const fs = require('fs');

const path = 'src/services/device.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace logPlayback function
const oldFunc = `  async logPlayback(deviceId: string, data: { campaignId: string; adId: number; duration: number }): Promise<void> {
    try {
      await api.post(ENDPOINTS.DEVICE_PLAYBACK(deviceId), data);
      console.log(\`[DeviceService][Playback] Logged ad \${data.adId} for \${data.duration}s\`);
    } catch (error: any) {
      console.warn(\`[DeviceService][Playback][Error] Failed to log ad \${data.adId}:\`, error.message);
    }
  },`;

const newFunc = `  async logPlayback(deviceId: string, data: { campaignId: string; adId: number; duration: number; sessionId: string }): Promise<void> {
    try {
      await api.post(ENDPOINTS.DEVICE_PLAYBACK(deviceId), data);
      console.log(\`[DeviceService][Playback] Logged ad \${data.adId} for \${data.duration}s\`);
    } catch (error: any) {
      console.warn(\`[DeviceService][Playback][Error] Failed to log ad \${data.adId}:\`, error.message);
      const { queuePlayback } = require('./offlineQueue');
      await queuePlayback(deviceId, data.adId, data.campaignId, data.duration, data.sessionId);
    }
  },`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync(path, content);
console.log('Fixed device.ts logPlayback');
