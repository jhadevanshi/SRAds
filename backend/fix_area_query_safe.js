const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

const searchStr = "        const campaignResult = await pool.query(\n          `SELECT c.* \n          FROM campaigns c\n          WHERE c.status = 'Active' \n          AND c.start_date <= CURRENT_DATE \n          AND c.end_date >= CURRENT_DATE\n          ORDER BY c.priority DESC, c.created_at DESC\n          LIMIT 1`,\n          []\n        );\n\n        if (campaignResult.rows.length > 0) {\n          campaign = campaignResult.rows[0];\n          detectedArea = campaign.area || campaign.campaign_name || 'Unknown';";

const fixStr = "        const campaignResult = await pool.query(\n          `SELECT c.* \n          FROM campaigns c\n          WHERE c.status = 'Active' \n          AND c.start_date <= CURRENT_DATE \n          AND c.end_date >= CURRENT_DATE\n          AND (c.area = 'all' OR c.area ILIKE $1)\n          ORDER BY c.priority DESC, c.created_at DESC\n          LIMIT 1`,\n          [`%${detectedArea}%`]\n        );\n\n        if (campaignResult.rows.length > 0) {\n          campaign = campaignResult.rows[0];\n          // We intentionally DO NOT overwrite detectedArea here so the Display App shows the real physical area";

content = content.replace(searchStr, fixStr);
fs.writeFileSync('routes/devices.js', content);
console.log('Fixed campaign area query');
