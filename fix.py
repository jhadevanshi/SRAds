import re
import os

with open('e:\\SRAds\\display-app\\src\\contexts\\AppContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update PlayerState in AppContext.tsx
content = content.replace("pendingCampaign: {", "brokenAds: { id: number; timestamp: number }[];\n  pendingCampaign: {")
content = content.replace("pendingCampaign: null,\n};", "pendingCampaign: null,\n  brokenAds: [],\n};")

# Update AppContextType definition
content = content.replace("nextAd: () => void;", "nextAd: (failedAdId?: number) => void;")

# Update Reducer for Blacklist
reducer_add = """    case 'BLACKLIST_AD':
      return { ...state, brokenAds: [...state.brokenAds.filter(b => b.id !== action.payload.id), action.payload] };
    case 'CLEAN_BLACKLIST':
      return { ...state, brokenAds: state.brokenAds.filter(b => action.payload - b.timestamp < 30 * 60 * 1000) };"""
content = content.replace("case 'SET_ERROR':", reducer_add + "\n    case 'SET_ERROR':")

# 2. Update nextAd function
old_next_ad = """  // 3. Playback Engine
  const nextAd = useCallback(async () => {
    const st = stateRef.current;
    
    // Check if we have a pending campaign ready to swap
    if (st.pendingCampaign && st.pendingCampaign.campaignId !== st.currentCampaignId) {
      console.log(`[CAMPAIGN] Evaluating pending campaign: ${st.pendingCampaign.campaignId}`);
      
      const readyPending: Advertisement[] = [];
      for (const ad of st.pendingCampaign.serverPlaylist) {
        const validPath = await cacheManager.isAdCached(ad);
        if (validPath) readyPending.push({ ...ad, localPath: validPath });
      }

      if (readyPending.length === st.pendingCampaign.serverPlaylist.length || readyPending.length > 0) {
        console.log(`[CAMPAIGN] Swapping to pending campaign ${st.pendingCampaign.campaignId} with ${readyPending.length} ready ads.`);
        
        activeServerPlaylist.current = st.pendingCampaign.serverPlaylist;
        
        await cacheStorage.saveCampaignId(st.pendingCampaign.campaignId);
        await cacheStorage.saveAds(activeServerPlaylist.current);

        dispatch({ type: 'APPLY_PENDING_CAMPAIGN', payload: { readyAds: readyPending } });
        return;
      } else {
        console.log(`[CAMPAIGN] Pending campaign ${st.pendingCampaign.campaignId} has NO ready ads yet. Delaying switch.`);
        // Fall through and play the next ad in the CURRENT campaign while we wait
      }
    }

    if (st.readyPlaylist.length === 0) {
      console.log('[PLAYER] No ready ads to advance to.');
      return;
    }

    const nextIndex = (st.currentAdIndex + 1) % st.readyPlaylist.length;
    console.log(`[PLAYER] Advancing to ad index ${nextIndex}`);
    dispatch({ type: 'SET_CURRENT_AD_INDEX', payload: nextIndex });
    
  }, []);"""

new_next_ad = """  // 3. Playback Engine
  const nextAd = useCallback(async (failedAdId?: number) => {
    const st = stateRef.current;
    const now = Date.now();
    
    dispatch({ type: 'CLEAN_BLACKLIST', payload: now });
    
    if (failedAdId) {
      dispatch({ type: 'BLACKLIST_AD', payload: { id: failedAdId, timestamp: now } });
    }
    
    // Check if we have a pending campaign ready to swap
    if (st.pendingCampaign && st.pendingCampaign.campaignId !== st.currentCampaignId) {
      console.log(`[CAMPAIGN] Evaluating pending campaign: ${st.pendingCampaign.campaignId}`);
      
      const readyPending: Advertisement[] = [];
      for (const ad of st.pendingCampaign.serverPlaylist) {
        const validPath = await cacheManager.isAdCached(ad);
        if (validPath) readyPending.push({ ...ad, localPath: validPath });
      }

      if (readyPending.length === st.pendingCampaign.serverPlaylist.length || readyPending.length > 0) {
        console.log(`[CAMPAIGN] Swapping to pending campaign ${st.pendingCampaign.campaignId} with ${readyPending.length} ready ads.`);
        activeServerPlaylist.current = st.pendingCampaign.serverPlaylist;
        await cacheStorage.saveCampaignId(st.pendingCampaign.campaignId);
        await cacheStorage.saveAds(activeServerPlaylist.current);
        dispatch({ type: 'APPLY_PENDING_CAMPAIGN', payload: { readyAds: readyPending } });
        return;
      } else {
        console.log(`[CAMPAIGN] Pending campaign ${st.pendingCampaign.campaignId} has NO ready ads yet. Delaying switch.`);
      }
    }
    
    // Get fresh state after possible dispatch above
    // We will use the existing st variable, but append failedAdId manually to the brokenAds check.
    const currentBrokenAds = [...(st.brokenAds || [])];
    if (failedAdId) currentBrokenAds.push({ id: failedAdId, timestamp: now });
    const activeBrokenAds = currentBrokenAds.filter(b => now - b.timestamp < 30 * 60 * 1000);
    const normalizedBrokenIds = new Set(activeBrokenAds.map(b => String(b.id)));
    
    const playableAds = st.readyPlaylist.filter(ad => !normalizedBrokenIds.has(String(ad.id)));
    
    console.log('[PLAYER][PLAYLIST]', {
        totalAds: st.readyPlaylist.length,
        brokenAds: Array.from(normalizedBrokenIds),
        playableAds: playableAds.map(ad => ad.id),
        currentIndex: st.currentAdIndex,
        currentAdId: st.readyPlaylist[st.currentAdIndex]?.id
    });

    if (playableAds.length === 0) {
      console.log('[PLAYER] No playable ads available. Entering fallback/idle state.');
      return;
    }
    
    const currentPlayingAd = st.readyPlaylist[st.currentAdIndex];
    let nextAdId;
    
    if (currentPlayingAd && !normalizedBrokenIds.has(String(currentPlayingAd.id))) {
      // Find its index in playableAds and increment
      const safeIndex = playableAds.findIndex(a => a.id === currentPlayingAd.id);
      const nextPlayableIndex = (safeIndex + 1) % playableAds.length;
      nextAdId = playableAds[nextPlayableIndex].id;
    } else {
      nextAdId = playableAds[0].id;
    }
    
    const nextIndex = st.readyPlaylist.findIndex(a => a.id === nextAdId);
    
    console.log('[PLAYER][NEXT_AD]', {
        playableAds: playableAds.map(ad => ad.id),
        currentIndex: nextIndex
    });
    
    dispatch({ type: 'SET_CURRENT_AD_INDEX', payload: nextIndex });
  }, []);"""

content = content.replace(old_next_ad, new_next_ad)

# 3. Add sequence number to Location Sync
content = content.replace("const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);", "const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);\n  const locationRequestSeqRef = useRef(0);")

sync_old = """  const syncCampaignWithBackend = useCallback(async (lat: number | null, lng: number | null, gpsStatus: string) => {
    telemetry.current.gpsAvailable = gpsStatus as any;
    const st = stateRef.current;
    
    if (!st.deviceInfo || !telemetry.current.isOnline) return;

    try {
      const response = await campaignService.updateLocation({
        deviceId: st.deviceInfo.id,
        latitude: lat as any,
        longitude: lng as any,
      });

      locationRetryCountRef.current = 0;

      if (response.ads && response.ads.length > 0) {
        const campaignId = response.campaign?.id?.toString() || 'general';
        const area = response.area || st.currentArea;
        
        // Determine if campaign actually changed"""

sync_new = """  const syncCampaignWithBackend = useCallback(async (lat: number | null, lng: number | null, gpsStatus: string) => {
    telemetry.current.gpsAvailable = gpsStatus as any;
    const st = stateRef.current;
    
    if (!st.deviceInfo || !telemetry.current.isOnline) return;
    
    const seq = ++locationRequestSeqRef.current;

    try {
      const response = await campaignService.updateLocation({
        deviceId: st.deviceInfo.id,
        latitude: lat as any,
        longitude: lng as any,
      });
      
      if (seq !== locationRequestSeqRef.current) {
        console.log('[GPS] Ignored stale location response (race condition prevented).');
        return;
      }

      locationRetryCountRef.current = 0;

      if (response.ads && response.ads.length > 0) {
        const campaignId = response.campaign?.id?.toString() || 'general';
        
        console.log('[GPS][AREA_RESPONSE]', { latitude: lat, longitude: lng, area: response.area });
        
        const area = response.area || st.currentArea;
        
        if (response.area && response.area !== st.currentArea) {
           await cacheStorage.saveArea(response.area);
           dispatch({ type: 'SET_AREA', payload: response.area });
           console.log('[GPS][CURRENT_AREA]', response.area);
        }
        
        // Determine if campaign actually changed"""

content = content.replace(sync_old, sync_new)

# 4. In checkAuth, load cached area early
auth_old = """        if (cachedAds && cachedAds.length > 0 && cachedCampaignId) {
          activeServerPlaylist.current = cachedAds;
          dispatch({ type: 'SET_CAMPAIGN', payload: { campaignId: cachedCampaignId, area: '', serverPlaylist: cachedAds } });"""
          
auth_new = """        if (cachedAds && cachedAds.length > 0 && cachedCampaignId) {
          activeServerPlaylist.current = cachedAds;
          const fallbackArea = await cacheStorage.getArea() || '';
          dispatch({ type: 'SET_CAMPAIGN', payload: { campaignId: cachedCampaignId, area: fallbackArea, serverPlaylist: cachedAds } });"""

content = content.replace(auth_old, auth_new)

with open('e:\\SRAds\\display-app\\src\\contexts\\AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AppContext.tsx updated successfully.")
