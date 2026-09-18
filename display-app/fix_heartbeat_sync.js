const fs = require('fs');

const path = 'src/contexts/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update syncPlaylistForArea to only dispatch if the playlist changed
const oldDispatch = `      if (playable.length > 0 || ads.length === 0) {
        dispatch({ type: 'SET_READY_PLAYLIST', payload: playable });
      }`;

const newDispatch = `      const currentPlayable = stateRef.current.readyPlaylist;
      const isDifferent = playable.length !== currentPlayable.length || playable.some((ad, i) => ad.id !== currentPlayable[i]?.id);
      
      if (isDifferent && (playable.length > 0 || ads.length === 0)) {
        console.log('[AppContext] Playlist changed. Updating state.');
        dispatch({ type: 'SET_READY_PLAYLIST', payload: playable });
      }`;

content = content.replace(oldDispatch, newDispatch);

// 2. Update sendHeartbeat to handle the response
const oldHeartbeat = `      await deviceService.sendHeartbeat({
        deviceId: st.deviceInfo.id,
        battery: Math.round(telemetry.current.battery * 100),
        gps: telemetry.current.gpsAvailable,
        internet: telemetry.current.isOnline,
        appVersion: APP_VERSION,
        currentAd: currentAd ? currentAd.id.toString() : 'none',
        currentCampaign: st.currentCampaignId || 'none',
      });
      console.log('[TELEMETRY] Heartbeat sent.');`;

const newHeartbeat = `      const response = await deviceService.sendHeartbeat({
        deviceId: st.deviceInfo.id,
        battery: Math.round(telemetry.current.battery * 100),
        gps: telemetry.current.gpsAvailable,
        internet: telemetry.current.isOnline,
        appVersion: APP_VERSION,
        currentAd: currentAd ? currentAd.id.toString() : 'none',
        currentCampaign: st.currentCampaignId || 'none',
      });
      console.log('[TELEMETRY] Heartbeat sent.');

      if (response && (response as any).ads) {
        const newArea = (response as any).area || st.currentArea;
        if (newArea !== st.currentArea) {
           dispatch({ type: 'SET_CURRENT_AREA', payload: newArea });
        }
        // Background sync playlist from heartbeat to catch newly uploaded ads instantly
        syncPlaylistForArea(newArea, (response as any).ads);
      }`;

content = content.replace(oldHeartbeat, newHeartbeat);

fs.writeFileSync(path, content);
console.log('Fixed AppContext to update playlist from heartbeat');
