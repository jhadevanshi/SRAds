const fs = require('fs');

let code = fs.readFileSync('routes/devices.js', 'utf8');

// 1. First SELECT mapping
code = code.replace(
  `a.play_duration as ad_play_duration,`,
  `a.play_duration as ad_play_duration, a.video_trim_start, a.video_trim_end,`
);
code = code.replace(
  `duration: ad.ca_duration || ad.ad_play_duration || ad.media_duration || 15`,
  `duration: ad.ca_duration || ad.ad_play_duration || ad.media_duration || 15,
            trimStart: ad.video_trim_start,
            trimEnd: ad.video_trim_end`
);

// 2. Second SELECT mapping
code = code.replace(
  `a.title, a.ad_type, a.play_duration,`,
  `a.title, a.ad_type, a.play_duration, a.video_trim_start, a.video_trim_end,`
);
code = code.replace(
  `duration: ad.play_duration || ad.media_duration || 15`,
  `duration: ad.play_duration || ad.media_duration || 15,
               trimStart: ad.video_trim_start,
               trimEnd: ad.video_trim_end`
);

// 3. Fallback campaigns mapping
code = code.replace(
  `duration: ad.ca_duration || ad.ad_play_duration || ad.media_duration || 15`,
  `duration: ad.ca_duration || ad.ad_play_duration || ad.media_duration || 15,
          trimStart: ad.video_trim_start,
          trimEnd: ad.video_trim_end`
);

// 4. Fallback general ads mapping
code = code.replace(
  `duration: ad.play_duration || ad.media_duration || 15`,
  `duration: ad.play_duration || ad.media_duration || 15,
          trimStart: ad.video_trim_start,
          trimEnd: ad.video_trim_end`
);


fs.writeFileSync('routes/devices.js', code);
console.log('Done');
