const fs = require('fs');

const content = fs.readFileSync('routes/business.js', 'utf8');

const updated = content.replace(
  /JOIN ads a ON a\.id = ads\.ad_id\s*GROUP BY a\.campaign_id/g,
  'JOIN campaign_ads ca ON ca.ad_id = ads.ad_id GROUP BY ca.campaign_id'
).replace(
  /a\.campaign_id,/g,
  'ca.campaign_id,'
);

fs.writeFileSync('routes/business.js', updated);
console.log('Fixed campaign_id reference in /campaigns query in business.js');
