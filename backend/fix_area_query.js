const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

const searchStr = \`        const campaignResult = await pool.query(
          \\\`SELECT c.* 
          FROM campaigns c
          WHERE c.status = 'Active' 
          AND c.start_date <= CURRENT_DATE 
          AND c.end_date >= CURRENT_DATE
          ORDER BY c.priority DESC, c.created_at DESC
          LIMIT 1\\\`,
          []
        );

        if (campaignResult.rows.length > 0) {
          campaign = campaignResult.rows[0];
          detectedArea = campaign.area || campaign.campaign_name || 'Unknown';\`;

const fixStr = \`        const campaignResult = await pool.query(
          \\\`SELECT c.* 
          FROM campaigns c
          WHERE c.status = 'Active' 
          AND c.start_date <= CURRENT_DATE 
          AND c.end_date >= CURRENT_DATE
          AND (c.area = 'all' OR c.area ILIKE $1)
          ORDER BY c.priority DESC, c.created_at DESC
          LIMIT 1\\\`,
          [\`%\${detectedArea}%\`]
        );

        if (campaignResult.rows.length > 0) {
          campaign = campaignResult.rows[0];
          // We intentionally DO NOT overwrite detectedArea here so the Display App shows the real physical area\`;

content = content.replace(searchStr, fixStr);
fs.writeFileSync('routes/devices.js', content);
console.log('Fixed campaign area query');
