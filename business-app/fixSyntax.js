const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const errorBlock = \`          </View>
        )}
          </View>
        )}\`;

const fixBlock = \`          </View>
        )}\`;

code = code.replace(errorBlock, fixBlock);

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Fixed syntax error');
