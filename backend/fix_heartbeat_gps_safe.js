const fs = require('fs');

const content = fs.readFileSync('routes/devices.js', 'utf8');

const targetStr = "    // Determine advertisements based on GPS location\n    let campaign = null;\n    let detectedArea = resolveArea(latitude, longitude);\n\n    let ads = [];\n    let fallback = false;\n    let fallbackReason = '';\n\n    try {\n      // STEP 1: Find ACTIVE campaign based on GPS location\n      if (latitude && longitude) {";

const replacementStr = "    // Determine advertisements based on GPS location\n    let campaign = null;\n    let resolvedLat = latitude || device.latitude;\n    let resolvedLng = longitude || device.longitude;\n    let detectedArea = resolveArea(resolvedLat, resolvedLng);\n\n    let ads = [];\n    let fallback = false;\n    let fallbackReason = '';\n\n    try {\n      // STEP 1: Find ACTIVE campaign based on GPS location\n      if (resolvedLat && resolvedLng) {";

const newContent = content.replace(targetStr, replacementStr);
fs.writeFileSync('routes/devices.js', newContent);
console.log('Fixed heartbeat GPS fallback in devices.js');
