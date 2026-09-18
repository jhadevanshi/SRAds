const fs = require('fs');

const content = fs.readFileSync('routes/devices.js', 'utf8');

// The file is corrupted around line 603
const goodPart1 = content.slice(0, content.indexOf('ads = generalAdsResult.rows.map(ad => {'));

const goodPart2 = content.slice(content.indexOf('      } catch (fallbackError) {'));

const fixedMiddle = `
        ads = generalAdsResult.rows.map(ad => {
          const absoluteUrl = toAbsolute(ad.file_url);
          console.log('[Ad Selection] Mapped ad', ad.id, 'url:', ad.file_url, '→', absoluteUrl);
          return {
            id: ad.id,
            title: ad.title,
            type: ad.media_type,
            url: absoluteUrl,
            duration: ad.play_duration || ad.media_duration || 15,
            trimStart: ad.video_trim_start,
            trimEnd: ad.video_trim_end
          };
        });
      }

      // STEP 3: If still no ads, log it but return empty array
      if (ads.length === 0) {
        console.log('[Ad Selection] No general ads available, leaving playlist empty');
        fallback = true;
        fallbackReason = 'No advertisements available';
      }

      console.log('[Ad Selection] Final Playlist Count:', ads.length);
      console.log('[Ad Selection] Fallback:', fallback, fallbackReason);

    } catch (adError) {
      console.error('[Ad Selection] Error during ad selection:', adError);
      // Always return general ads on error
      fallback = true;
      fallbackReason = 'Ad selection error, using general ads';
      
      try {
        const generalAdsResult = await pool.query(
          \`SELECT a.id, a.title, a.ad_type, a.play_duration, a.video_trim_start, a.video_trim_end,
                  m.file_url, m.media_type, m.duration as media_duration
          FROM ads a
          LEFT JOIN media m ON a.media_id = m.id
          WHERE a.status = 'Active'
          AND a.ad_type = 'GENERAL'
          ORDER BY a.created_at DESC\`,
          []
        );

        ads = generalAdsResult.rows.map(ad => ({
          id: ad.id,
          title: ad.title,
          type: ad.media_type,
          url: toAbsolute(ad.file_url),
          duration: ad.play_duration || ad.media_duration || 15,
          trimStart: ad.video_trim_start,
          trimEnd: ad.video_trim_end
        }));
`;

fs.writeFileSync('routes/devices.js', goodPart1 + fixedMiddle + goodPart2);
console.log('Fixed devices.js manually!');
