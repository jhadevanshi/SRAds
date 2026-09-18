const fs = require('fs');

const content = fs.readFileSync('routes/business.js', 'utf8');

const newQuery = `
      SELECT 
        a.id,
        a.title,
        m.media_type as type,
        a.approval_status,
        a.remaining_budget,
        a.budget,
        a.cost_per_play,
        a.created_at,
        m.file_url,
        m.thumbnail_url,
        
        -- Real plays count from playback_logs:
        COALESCE(p.total_plays, 0) AS total_plays,
        
        -- Real spend from wallet_transactions:
        COALESCE(w.total_spend, 0) AS total_spend,
        
        -- Today's plays:
        COALESCE(today.plays_today, 0) AS plays_today,
        
        -- Today's spend:
        COALESCE(today.spend_today, 0) AS spend_today,
        
        -- Distance covered:
        COALESCE(d.distance_km, 0) AS distance_km
        
      FROM ads a
      
      LEFT JOIN media m ON a.media_id = m.id
      
      -- Total plays from playback_logs
      LEFT JOIN (
        SELECT ad_id, COUNT(*) as total_plays
        FROM playback_logs
        GROUP BY ad_id
      ) p ON p.ad_id = a.id
      
      -- Total spend from wallet_transactions
      LEFT JOIN (
        SELECT ad_id, SUM(ABS(amount)) as total_spend
        FROM wallet_transactions
        WHERE type = 'Debit'
        GROUP BY ad_id
      ) w ON w.ad_id = a.id
      
      -- Today's stats
      LEFT JOIN (
        SELECT 
          ad_id,
          COUNT(*) as plays_today,
          SUM(ABS(amount)) as spend_today
        FROM playback_logs pl
        LEFT JOIN wallet_transactions wt ON wt.ad_id = pl.ad_id 
          AND DATE(wt.created_at) = CURRENT_DATE
        WHERE DATE(pl.played_at) = CURRENT_DATE
        GROUP BY ad_id
      ) today ON today.ad_id = a.id
      
      -- Distance from ad_daily_stats
      LEFT JOIN (
        SELECT ad_id, SUM(distance_km) as distance_km
        FROM ad_daily_stats
        GROUP BY ad_id
      ) d ON d.ad_id = a.id
      
      WHERE a.advertiser_id = $1
      ORDER BY a.created_at DESC
`;

const updated = content.replace(
  /SELECT a\.\*,[\s\S]*?ORDER BY a\.created_at DESC/m,
  newQuery.trim()
);

fs.writeFileSync('routes/business.js', updated);
console.log('Updated /ads query in business.js');
