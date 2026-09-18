const fs = require('fs');
let content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const searchStr = \`              </View>

            {whereMode === 'specific' && ROUTES.map(routeItem => {\`;

const fixStr = \`              </View>
            </View>

            {whereMode === 'specific' && ROUTES.map(routeItem => {\`;

content = content.replace(searchStr, fixStr);
fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', content);
console.log('Fixed View syntax');
