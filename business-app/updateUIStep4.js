const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const startIdx = code.indexOf('{/* STEP 4: REVIEW & ESTIMATED COST */}');
// We need to find where Step 4 ends.
// Let's find: '{safeCost > safeWalletBalance && ('
const endIdx = code.indexOf('{safeCost > safeWalletBalance && (', startIdx);
// Let's replace everything between startIdx and endIdx
if (startIdx !== -1 && endIdx !== -1) {
    const oldStep4 = code.substring(startIdx, endIdx);
    
    const newStep4 = \`{/* STEP 4: REVIEW & ESTIMATED COST */}
        {step === 4 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Review & Launch</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Review your schedule and estimated maximum cost.</Text>

            {/* CARD 1: SUMMARY */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ad Summary</Text>
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Creative</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4" numberOfLines={1}>{form.ad?.title}</Text>
              </View>
              
              <View className="flex-row justify-between mb-4 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Type & Duration</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{form.ad?.media_type === 'video' ? 'Video Ad' : 'Image Ad'} • {safeDuration}s</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />

              <View className="flex-row justify-between mb-4 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Target Location</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{whereMode === 'everywhere' ? 'Everywhere' : \`\${form.routes.length} Selected Routes\`}</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />

              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Date Range</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{formatDate(startDate)} → {formatDate(endDate)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Daily Time Slot</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{formatTime(startTime)} → {formatTime(endTime)}</Text>
              </View>
            </View>

            {/* CARD 2: COST & BALANCE BREAKDOWN */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 mb-5 shadow-sm">
              <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Cost Breakdown</Text>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Active Days</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeScheduledDays}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Plays per Day</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safePlaysPerDay}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-[13px] text-slate-500 font-bold">Total Est. Plays</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeTotalPlays}</Text>
              </View>

              <View className="bg-[#F8FAFC] dark:bg-[#0D1117] border border-slate-100 dark:border-[#1F2937] rounded-xl p-4 flex-row justify-between items-center mb-5 shadow-sm">
                <Text className="text-[13px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wide">Max Est. Cost</Text>
                <Text className="text-[20px] text-[#F59E0B] font-black">₹{safeCost.toFixed(2)}</Text>
              </View>
              
              {/* Disclaimer Callout */}
              <View className="bg-blue-50/80 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3 flex-row mb-5 items-start shadow-sm">
                <Text className="text-blue-500 mr-2 mt-0.5 text-sm">ℹ️</Text>
                <Text className="flex-1 text-[12px] text-blue-700 dark:text-blue-300 font-semibold leading-relaxed">
                  Actual deductions occur incrementally based on verified playbacks. This is the maximum expected cost.
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-5" />

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Current Wallet Balance</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[13px] text-slate-900 dark:text-white font-black">Balance After Deductions</Text>
                <Text className={\`text-[16px] font-black \${(safeWalletBalance - safeCost) < 0 ? 'text-red-500' : 'text-emerald-500'}\`}>
                  ₹{(safeWalletBalance - safeCost).toFixed(2)}
                </Text>
              </View>
            </View>

            \`;
    
    code = code.replace(oldStep4, newStep4);
    fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
    console.log('Step 4 UI updated');
} else {
    console.log('Could not find start or end index for step 4 replacement');
}
