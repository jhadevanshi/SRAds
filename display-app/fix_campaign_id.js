const fs = require('fs');

const path = 'src/contexts/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update sendHeartbeat to also dispatch SET_CAMPAIGN_ID
const oldHeartbeat = `      if (response && (response as any).ads) {
        const newArea = (response as any).area || st.currentArea;
        if (newArea !== st.currentArea) {
           dispatch({ type: 'SET_CURRENT_AREA', payload: newArea });
        }
        // Background sync playlist from heartbeat to catch newly uploaded ads instantly
        syncPlaylistForArea(newArea, (response as any).ads);
      }`;

const newHeartbeat = `      if (response && (response as any).ads) {
        const newArea = (response as any).area || st.currentArea;
        if (newArea !== st.currentArea) {
           dispatch({ type: 'SET_CURRENT_AREA', payload: newArea });
        }
        
        // Ensure campaign ID is tracked so playbacks correctly increment campaign totals
        const newCampaignId = (response as any).campaign?.id?.toString() || 'none';
        if (newCampaignId !== st.currentCampaignId) {
           dispatch({ type: 'SET_CAMPAIGN_ID', payload: newCampaignId });
        }

        // Background sync playlist from heartbeat to catch newly uploaded ads instantly
        syncPlaylistForArea(newArea, (response as any).ads);
      }`;

content = content.replace(oldHeartbeat, newHeartbeat);

fs.writeFileSync(path, content);
console.log('Fixed AppContext to save campaign ID');
