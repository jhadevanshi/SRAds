const fs = require('fs');

const content = fs.readFileSync('routes/business.js', 'utf8');

const updated = content.replace(
  "await pool.query('DELETE FROM ads WHERE id = $1', [req.params.id]);",
  `
    const camRes = await pool.query('SELECT campaign_id FROM campaign_ads WHERE ad_id = $1', [req.params.id]);
    const campaignIds = camRes.rows.map(r => r.campaign_id);

    await pool.query('DELETE FROM ads WHERE id = $1', [req.params.id]);
    
    if (campaignIds.length > 0) {
      await pool.query('DELETE FROM campaigns WHERE id = ANY($1::int[])', [campaignIds]);
    }
  `
);

fs.writeFileSync('routes/business.js', updated);
console.log('Fixed business app ad deletion cascading');
