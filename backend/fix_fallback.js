const fs = require('fs');
let content = fs.readFileSync('routes/devices.js', 'utf8');

const badBlock = `      } catch (fallbackError) {
        console.error('[Ad Selection] Fallback also failed:', fallbackError);
        ads = [{
          id: 0,
          title: 'SRAds Placeholder',
          type: 'image',
          url: 'https://via.placeholder.com/1920x1080/000000/FFFFFF?text=SRAds+No+Ads',
          duration: 15
        }];
      }`;

const goodBlock = `      } catch (fallbackError) {
        console.error('[Ad Selection] Fallback also failed:', fallbackError);
        ads = [];
      }`;

content = content.replace(badBlock, goodBlock);
fs.writeFileSync('routes/devices.js', content);
console.log('Fixed fallbackError block');
