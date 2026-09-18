const fs = require('fs');

const path = 'src/screens/main/AdsListScreen.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStatsBlock = `          <View className="flex-row flex-wrap justify-between mb-4 pb-4 border-b border-slate-100 dark:border-[#30363D]">
            <View className="w-1/2 mb-4 pr-2">
              <View className="flex-row items-center mb-1">
                <Text className="text-xs mr-1">▶️</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest">Total Plays</Text>
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black">{Number(item.total_plays || 0).toLocaleString('en-IN')}</Text>
            </View>

            <View className="w-1/2 mb-4 pl-2">
              <View className="flex-row items-center mb-1">
                <Text className="text-xs mr-1">₹</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest">Spend</Text>
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black">₹{Number(item.total_spend || 0).toFixed(2)}</Text>
            </View>

            <View className="w-1/2 pr-2">
              <View className="flex-row items-center mb-1">
                <Text className="text-xs mr-1">📍</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest">Distance</Text>
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black">{Number(item.distance_km || 0).toFixed(1)} km</Text>
            </View>

            <View className="w-1/2 pl-2">
              <View className="flex-row items-center mb-1">
                <Text className="text-xs mr-1">💰</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest">Budget Left</Text>
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black">₹{Number(item.remaining_budget || 0).toFixed(2)}</Text>
            </View>
          </View>`;

const newStatsBlock = `          <View className="bg-slate-50 dark:bg-[#0D1117] rounded-2xl p-4 mb-6 border border-slate-200 dark:border-[#30363D]">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-1/2 mb-4 pr-2">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs mr-1">▶️</Text>
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Plays</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-black text-lg">{Number(item.total_plays || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View className="w-1/2 mb-4 pl-2">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs mr-1">₹</Text>
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spend</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-black text-lg">₹{Number(item.total_spend || 0).toFixed(2)}</Text>
              </View>
              <View className="w-1/2 pr-2">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs mr-1">📍</Text>
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Distance</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-black text-lg">{Number(item.distance_km || 0).toFixed(1)} km</Text>
              </View>
              <View className="w-1/2 pl-2">
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs mr-1">💰</Text>
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Budget Left</Text>
                </View>
                <Text className="text-amber-600 dark:text-amber-400 font-black text-lg">₹{Math.max(0, Number(item.budget || 0) - Number(item.total_spend || 0)).toFixed(2)}</Text>
              </View>
            </View>
          </View>`;

if (content.includes(targetStatsBlock)) {
  content = content.replace(targetStatsBlock, newStatsBlock);
  fs.writeFileSync(path, content);
  console.log('Replaced stats block successfully');
} else {
  console.log('Target block not found, trying partial replacement');
  // Just a fallback in case formatting slightly differs
  content = content.replace(/<View className="flex-row flex-wrap justify-between mb-4 pb-4 border-b border-slate-100 dark:border-\[\#30363D\]">[\s\S]*?<\/View>\s*<\/View>/, newStatsBlock);
  fs.writeFileSync(path, content);
}
