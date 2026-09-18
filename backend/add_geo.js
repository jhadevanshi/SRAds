const fs = require('fs');

let content = fs.readFileSync('routes/devices.js', 'utf8');

// Insert our geocoding logic right after the require statements
const geocodingLogic = `
// Hardcoded Ahmedabad areas for MVP geo-hashing
const AREA_COORDINATES = [
  { name: 'Navrangpura', lat: 23.0366, lng: 72.5615 },
  { name: 'Bopal', lat: 23.0298, lng: 72.4646 },
  { name: 'Bapunagar', lat: 23.0401, lng: 72.6318 },
  { name: 'Ranip', lat: 23.0775, lng: 72.5746 },
  { name: 'Shivranjini', lat: 23.0248, lng: 72.5295 },
  { name: 'SG Highway', lat: 23.0760, lng: 72.5255 },
  { name: 'Paldi', lat: 23.0120, lng: 72.5629 }
];

function getDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function resolveArea(lat, lng) {
  if (!lat || !lng) return 'Unknown';
  
  let closestArea = 'Unknown';
  let minDistance = Infinity;
  
  for (const area of AREA_COORDINATES) {
    const d = getDistance(lat, lng, area.lat, area.lng);
    // If within 5km, consider it a match
    if (d < minDistance) {
      minDistance = d;
      closestArea = area.name;
    }
  }
  
  // If the closest area is still more than 7km away, we might be outside the covered zones, 
  // but let's just return the closest one for the MVP.
  return minDistance < 7 ? closestArea : 'Ahmedabad Outskirts';
}
`;

content = content.replace("const router = express.Router();", "const router = express.Router();\n" + geocodingLogic);

// Now update the detectedArea logic in the /status endpoint
const target = `    // Determine advertisements based on GPS location
    let campaign = null;
    let detectedArea = 'Unknown';`;

const replacement = `    // Determine advertisements based on GPS location
    let campaign = null;
    let detectedArea = resolveArea(latitude, longitude);`;

content = content.replace(target, replacement);

fs.writeFileSync('routes/devices.js', content);
console.log('Added geo-resolution logic to devices.js');
