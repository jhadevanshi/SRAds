const fs = require('fs');

const content = fs.readFileSync('routes/ads.js', 'utf8');

const updated = content.replace(
  "const result = await pool.query(\n      'DELETE FROM ads WHERE id = $1 RETURNING *',\n      [req.params.id]\n    );",
  `
    // First, find campaigns that contain this ad
    const camRes = await pool.query('SELECT campaign_id FROM campaign_ads WHERE ad_id = $1', [req.params.id]);
    const campaignIds = camRes.rows.map(r => r.campaign_id);

    const result = await pool.query(
      'DELETE FROM ads WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    // Now delete those campaigns (they should be orphaned anyway)
    if (campaignIds.length > 0) {
      await pool.query(
        'DELETE FROM campaigns WHERE id = ANY($1::int[])',
        [campaignIds]
      );
    }
  `
);

fs.writeFileSync('routes/ads.js', updated);
console.log('Fixed ad deletion cascading');
