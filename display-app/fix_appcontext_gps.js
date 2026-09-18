const fs = require('fs');

const path = 'src/contexts/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldGPS = `      startLocationTracking(deviceId, (newArea, ads) => {
        console.log(\`[AppContext] GPS callback - New Area: \${newArea}\`);
        dispatch({ type: 'SET_CURRENT_AREA', payload: newArea });
        if (ads && ads.length > 0) {
          syncPlaylist(newArea, ads);
        } else if (ads && ads.length === 0) {
           syncPlaylist(newArea, []);
        }
      });`;

const newGPS = `      startLocationTracking(deviceId, (newArea, ads, campaignId) => {
        console.log(\`[AppContext] GPS callback - New Area: \${newArea}, Campaign: \${campaignId}\`);
        dispatch({ type: 'SET_CURRENT_AREA', payload: newArea });
        if (campaignId && campaignId !== stateRef.current.currentCampaignId) {
          dispatch({ type: 'SET_CAMPAIGN_ID', payload: campaignId });
        }
        if (ads && ads.length > 0) {
          syncPlaylist(newArea, ads);
        } else if (ads && ads.length === 0) {
           syncPlaylist(newArea, []);
        }
      });`;

content = content.replace(oldGPS, newGPS);

fs.writeFileSync(path, content);
console.log('Fixed AppContext GPS callback to save campaignId');
