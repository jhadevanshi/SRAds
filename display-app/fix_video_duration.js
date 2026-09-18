const fs = require('fs');

const path = 'src/player/AdPlayer.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldVideoLogic = `        // Swap to Player B (covers A or none)
        if (videoUri) {
          playerB.replace({ uri: videoUri });
        }
        if (currentAd.trimStart) {
          playerB.currentTime = currentAd.trimStart;
        }
        playerB.play();
        setActivePlayer('B');
        activePlayerRef.current = 'B';

        // Preload next ad on Player A (if video)
        if (nextAd && nextAd.type === 'video' && nextAd.localPath) {
          playerA.replace({ uri: nextAd.localPath });
        }
      }
    } else {
      // It's an image
      setActivePlayer('none');
      activePlayerRef.current = 'none';
      playerA.pause();
      playerB.pause();
      setImageUri(currentAd.localPath || currentAd.url);

      // Display image for duration, then transition
      const duration = (currentAd.duration || 15) * 1000;
      imageTimerRef.current = setTimeout(() => {
        const nextIdx = (currentIndexRef.current + 1) % playlistRef.current.length;
        playAd(nextIdx);
        nextAdCallback();
      }, duration);
    }`;

const newVideoLogic = `        // Swap to Player B (covers A or none)
        if (videoUri) {
          playerB.replace({ uri: videoUri });
        }
        if (currentAd.trimStart) {
          playerB.currentTime = currentAd.trimStart;
        }
        playerB.play();
        setActivePlayer('B');
        activePlayerRef.current = 'B';

        // Preload next ad on Player A (if video)
        if (nextAd && nextAd.type === 'video' && nextAd.localPath) {
          playerA.replace({ uri: nextAd.localPath });
        }
      }
      
      // Enforce play duration for videos (especially trimmed videos)
      const duration = (currentAd.duration || 15) * 1000;
      imageTimerRef.current = setTimeout(() => {
        const nextIdx = (currentIndexRef.current + 1) % playlistRef.current.length;
        playAd(nextIdx);
        nextAdCallback();
      }, duration);

    } else {
      // It's an image
      setActivePlayer('none');
      activePlayerRef.current = 'none';
      playerA.pause();
      playerB.pause();
      setImageUri(currentAd.localPath || currentAd.url);

      // Display image for duration, then transition
      const duration = (currentAd.duration || 15) * 1000;
      imageTimerRef.current = setTimeout(() => {
        const nextIdx = (currentIndexRef.current + 1) % playlistRef.current.length;
        playAd(nextIdx);
        nextAdCallback();
      }, duration);
    }`;

content = content.replace(oldVideoLogic, newVideoLogic);

fs.writeFileSync(path, content);
console.log('Fixed AdPlayer.tsx video duration enforcement');
