const fs = require('fs');

const path = 'src/services/gpsManager.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "let onAreaChange: ((area: string, ads: Advertisement[]) => void) | null = null;",
  "let onAreaChange: ((area: string, ads: Advertisement[], campaignId?: string) => void) | null = null;"
);

content = content.replace(
  "export async function init(onAreaChangeCallback: (area: string, ads: Advertisement[]) => void): Promise<void> {",
  "export async function init(onAreaChangeCallback: (area: string, ads: Advertisement[], campaignId?: string) => void): Promise<void> {"
);

const oldAreaChange = `    if (newArea) {
      currentArea = newArea;
      await AsyncStorage.setItem('last_area', newArea);
      
      if (onAreaChange) {
        onAreaChange(newArea, ads);
      }
    }`;

const newAreaChange = `    if (newArea) {
      currentArea = newArea;
      await AsyncStorage.setItem('last_area', newArea);
      
      if (onAreaChange) {
        onAreaChange(newArea, ads, response?.campaign?.id?.toString() || 'none');
      }
    }`;

content = content.replace(oldAreaChange, newAreaChange);

fs.writeFileSync(path, content);
console.log('Fixed gpsManager.ts to pass campaignId');
