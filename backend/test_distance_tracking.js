const pool = require('./config/database');

async function verifyDistanceTracking() {
  try {
    // 1. Setup - Get a valid device ID and ad ID
    const deviceRes = await pool.query("SELECT * FROM devices LIMIT 1");
    if (deviceRes.rows.length === 0) return console.log("No devices found.");
    const device = deviceRes.rows[0];

    const adRes = await pool.query("SELECT id FROM ads WHERE status = 'Active' LIMIT 1");
    const adId = adRes.rows.length > 0 ? adRes.rows[0].id : null;

    console.log(`Testing with Device ID: ${device.id}, Ad ID: ${adId}`);

    // Initial heartbeat - establishing previous coordinates
    // location 1: Navrangpura, Ahmedabad
    const r1 = await fetch(`http://localhost:5000/api/devices/${device.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 23.0365,
        longitude: 72.5611,
        gps_status: 'Active',
        internet_status: 'Connected',
        battery_level: 90,
        currently_playing_ad: adId ? `Ad-${adId}` : 'none'
      })
    });
    if (!r1.ok) throw new Error(await r1.text());

    console.log('Sent Initial Heartbeat (Established Location 1). Waiting 5 seconds...');
    
    await new Promise(r => setTimeout(r, 5000));

    // Second heartbeat - moved ~44 meters (Realistic Speed)
    const r2 = await fetch(`http://localhost:5000/api/devices/${device.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 23.0369,
        longitude: 72.5611,
        gps_status: 'Active',
        internet_status: 'Connected',
        battery_level: 89,
        currently_playing_ad: adId ? `Ad-${adId}` : 'none'
      })
    });
    if (!r2.ok) throw new Error(await r2.text());

    console.log('Sent Second Heartbeat (Moved to Location 2).');

    // 2. Verify Devices Table Updates
    const updatedDevice = await pool.query("SELECT total_distance_km, today_distance_km FROM devices WHERE id = $1", [device.id]);
    console.log(`Device Distances -> Total: ${updatedDevice.rows[0].total_distance_km} km | Today: ${updatedDevice.rows[0].today_distance_km} km`);

    // 3. Verify Ad Daily Stats Updates
    if (adId) {
      const adStats = await pool.query("SELECT distance_km FROM ad_daily_stats WHERE ad_id = $1", [adId]);
      if (adStats.rows.length > 0) {
        console.log(`Ad Daily Stats -> Distance Covered: ${adStats.rows[0].distance_km} km`);
      } else {
        console.log('Ad Daily Stats -> Not found (Should have been inserted!)');
      }
    }

  } catch (err) {
    console.error('Verification failed:', err.response?.data || err.message);
  } finally {
    pool.end();
  }
}

verifyDistanceTracking();
