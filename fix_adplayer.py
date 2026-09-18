import re

with open('e:\\SRAds\\display-app\\src\\player\\AdPlayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix handleAdFailure
handle_failure_old = """  const handleAdFailure = React.useCallback((reason?: string) => {
    if (!currentAd) return;
    console.log(`[PLAYER DEBUG] Ad skipped (Failure) - ${reason || 'Unknown'}`);
    
    failureCounts[currentAd.id] = (failureCounts[currentAd.id] || 0) + 1;
    cacheManager.requestRedownload(currentAd);
    
    // Clear timers
    if (loadWatchdogRef.current) clearTimeout(loadWatchdogRef.current);
    if (playWatchdogRef.current) clearTimeout(playWatchdogRef.current);
    
    // Check if we need to apply backoff for single-ad playlists
    if (state.readyPlaylist.length === 1) {
      console.log(`[PLAYER DEBUG] Retry scheduled (Backoff: 10s)`);
      setTimeout(() => nextAd(), 10000);
    } else {
      setTimeout(() => nextAd(), 500); // short delay to prevent thrashing
    }
  }, [currentAd, nextAd, state.readyPlaylist.length]);"""

handle_failure_new = """  const handleAdFailure = React.useCallback((reason?: string) => {
    if (!currentAd) return;
    console.log(`[PLAYER DEBUG] Ad skipped (Failure) - ${reason || 'Unknown'}`);
    
    const count = (failureCounts[currentAd.id] || 0) + 1;
    failureCounts[currentAd.id] = count;
    
    // Clear timers
    if (loadWatchdogRef.current) clearTimeout(loadWatchdogRef.current);
    if (playWatchdogRef.current) clearTimeout(playWatchdogRef.current);
    
    if (count >= MAX_CONSECUTIVE_FAILURES) {
      console.log(`[PLAYER DEBUG] Ad ${currentAd.id} reached max failures. Blacklisting and requesting redownload.`);
      cacheManager.requestRedownload(currentAd);
      // Let the blacklist system handle the fallback gracefully
      setTimeout(() => nextAd(currentAd.id), 500);
    } else {
      console.log(`[PLAYER DEBUG] Ad ${currentAd.id} failed (Attempt ${count}/${MAX_CONSECUTIVE_FAILURES}).`);
      setTimeout(() => nextAd(), 500);
    }
  }, [currentAd, nextAd]);"""

content = content.replace(handle_failure_old, handle_failure_new)

# Remove the custom backoff check in useEffect (now handled by blacklist fallback)
use_effect_old = """    if (failureCounts[currentAd.id] >= MAX_CONSECUTIVE_FAILURES) {
      console.log(`[PLAYER DEBUG] Ad ${currentAd.id} is blacklisted due to >= ${MAX_CONSECUTIVE_FAILURES} failures.`);
      if (state.readyPlaylist.length === 1) {
        console.log(`[PLAYER DEBUG] Retry scheduled (Backoff: 15s)`);
        setTimeout(() => nextAd(), 15000); // 15s backoff
      } else {
        setTimeout(() => nextAd(), 500);
      }
      return;
    }"""

use_effect_new = """    // We no longer rely on failureCounts to skip rendering here
    // because the blacklist system filters the ad out of playableAds entirely."""

content = content.replace(use_effect_old, use_effect_new)

with open('e:\\SRAds\\display-app\\src\\player\\AdPlayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdPlayer.tsx updated successfully.")
