const fs = require('fs');
let content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const s1 = "              </View>\n          <Text className=\"text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1\">Target Audience Reach</Text>\n                <View className=\"flex-row items-center\">\n                  <Text className=\"text-white font-black text-xl\">{totalSelectedScreens} Screens</Text>\n                  <Text className=\"text-slate-400 font-bold ml-2\">across {totalSelectedBrts} BRTs</Text>\n                </View>\n              </View>\n\n            {whereMode === 'specific' && ROUTES.map(routeItem => {\n              const isSelected = form.routes.find(r => r.id === routeItem.id);\n              return (";

const f1 = "              </View>\n            </View>\n\n            {/* Specific Route Selection */}\n            {whereMode === 'specific' && ROUTES.map(routeItem => {\n              const isSelected = form.routes.find(r => r.id === routeItem.id);\n              return (";

content = content.replace(s1, f1);
fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', content);
console.log('Done');
