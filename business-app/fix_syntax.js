const fs = require('fs');
let content = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// The botched replace removed the comment and closing View tag
const searchStr = \`              </View>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Target Audience Reach</Text>
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-xl">{totalSelectedScreens} Screens</Text>
                  <Text className="text-slate-400 font-bold ml-2">across {totalSelectedBrts} BRTs</Text>
                </View>
              </View>

            {whereMode === 'specific' && ROUTES.map(routeItem => {
              const isSelected = form.routes.find(r => r.id === routeItem.id);
              return (\`;

const fixStr = \`              </View>
            </View>

            {/* Specific Route Selection */}
            {whereMode === 'specific' && ROUTES.map(routeItem => {
              const isSelected = form.routes.find(r => r.id === routeItem.id);
              return (\`;

content = content.replace(searchStr, fixStr);
fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', content);
console.log('Fixed syntax error in CreateCampaignScreen.jsx');
