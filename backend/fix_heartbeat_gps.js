const fs = require('fs');

const content = fs.readFileSync('routes/devices.js', 'utf8');

const targetStr = \`    // Determine advertisements based on GPS location
    let campaign = null;
    let detectedArea = resolveArea(latitude, longitude);

    let ads = [];
    let fallback = false;
    let fallbackReason = '';

    try {
      // STEP 1: Find ACTIVE campaign based on GPS location
      if (latitude && longitude) {\`;

const replacementStr = \`    // Determine advertisements based on GPS location
    let campaign = null;
    let resolvedLat = latitude || device.latitude;
    let resolvedLng = longitude || device.longitude;
    let detectedArea = resolveArea(resolvedLat, resolvedLng);

    let ads = [];
    let fallback = false;
    let fallbackReason = '';

    try {
      // STEP 1: Find ACTIVE campaign based on GPS location
      if (resolvedLat && resolvedLng) {\`;

const newContent = content.replace(targetStr, replacementStr);
fs.writeFileSync('routes/devices.js', newContent);
console.log('Fixed heartbeat GPS fallback in devices.js');
