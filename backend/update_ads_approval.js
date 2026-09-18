const fs = require('fs');

const content = fs.readFileSync('routes/ads.js', 'utf8');

// Fix Approve
let updated = content.replace(
  "if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Ad not found' });",
  `if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Ad not found' });

    // Also approve associated campaigns
    try {
      await pool.query(
        "UPDATE campaigns SET approval_status = 'Approved', status = 'Active' WHERE id IN (SELECT campaign_id FROM campaign_ads WHERE ad_id = $1)",
        [req.params.id]
      );
    } catch (e) {
      console.error('Failed to auto-approve associated campaigns:', e);
    }`
);

// Fix Reject
updated = updated.replace(
  "if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Ad not found' });",
  `if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Ad not found' });

    // Also reject associated campaigns
    try {
      await pool.query(
        "UPDATE campaigns SET approval_status = 'Rejected', status = 'Inactive' WHERE id IN (SELECT campaign_id FROM campaign_ads WHERE ad_id = $1)",
        [req.params.id]
      );
    } catch (e) {
      console.error('Failed to auto-reject associated campaigns:', e);
    }`
);

fs.writeFileSync('routes/ads.js', updated);
console.log('Updated routes/ads.js to cascade approval/rejection to campaigns');
