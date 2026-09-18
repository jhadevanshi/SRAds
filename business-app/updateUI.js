const fs = require('fs');

let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// 1. Fix the top header & Progress Bar (Stepper)
const oldHeaderAndProgress = `      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] z-10 flex-row items-center">
        <TouchableOpacity 
          onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} 
          className="bg-slate-50 dark:bg-[#161B22] p-2 rounded-full border border-slate-200 dark:border-[#30363D] mr-3"
        >
          <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Launch Your Ad</Text>
      </View>

      {/* Progress Bar */}
      <View className="px-5 py-4 bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-[#1F2937]">
        <View className="flex-row items-center justify-between mb-2">
          {['Ad', 'Where', 'Schedule', 'Review'].map((label, idx) => (
            <View key={label} className={\`flex-1 \${idx !== 3 ? 'border-b-4' : 'border-b-4 border-transparent'} \${step > idx + 1 ? 'border-amber-500' : step === idx + 1 ? 'border-amber-500' : 'border-slate-200 dark:border-[#30363D]'} pb-2 mx-0.5\`}>
              <Text className={\`text-[10px] font-black uppercase text-center \${step >= idx + 1 ? 'text-amber-500' : 'text-slate-400 dark:text-[#8B949E]'}\`}>{label}</Text>
            </View>
          ))}
        </View>
      </View>`;

const newHeaderAndProgress = `      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] flex-row items-center justify-between z-10">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} 
            className="bg-slate-50 dark:bg-[#161B22] p-2 rounded-full border border-slate-200 dark:border-[#30363D] mr-3"
          >
            <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Launch Your Ad</Text>
        </View>
      </View>

      {/* Modern Segmented Stepper */}
      <View className="px-4 py-3 bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-[#1F2937]">
        <View className="flex-row justify-between">
          {['Ad', 'Where', 'Schedule', 'Review'].map((label, idx) => (
            <View key={label} className="flex-1 px-1">
              <View className={\`h-1 rounded-full w-full mb-1.5 \${step >= idx + 1 ? 'bg-[#F59E0B]' : 'bg-slate-100 dark:bg-[#30363D]'}\`} />
              <Text className={\`text-[10px] font-black uppercase text-center \${step >= idx + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#8B949E]'}\`}>{label}</Text>
            </View>
          ))}
        </View>
      </View>`;

code = code.replace(oldHeaderAndProgress, newHeaderAndProgress);

// 2. Fix Step 4 (Review) Card Layout
const step4Regex = /\{\/\* STEP 4: REVIEW & ESTIMATED COST \*\/\}\s*\{step === 4 && \([\s\S]*?\{safeCost > safeWalletBalance && \(/;

const newStep4 = `{/* STEP 4: REVIEW & ESTIMATED COST */}
        {step === 4 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Review & Launch</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Review your schedule and estimated maximum cost.</Text>

            {/* CARD 1: SUMMARY */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-5 mb-4 shadow-sm">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Ad Summary</Text>
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Creative</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4" numberOfLines={1}>{form.ad?.title}</Text>
              </View>
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Type & Duration</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{form.ad?.media_type === 'video' ? 'Video Ad' : 'Image Ad'} • {safeDuration}s</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-3" />

              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Target Location</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{whereMode === 'everywhere' ? 'Everywhere' : \`\${form.routes.length} Selected Routes\`}</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-3" />

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
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-5 mb-5 shadow-sm">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Cost Breakdown</Text>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-slate-500 font-bold">Active Days</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeScheduledDays}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-[13px] text-slate-500 font-bold">Plays per Day</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safePlaysPerDay}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Total Est. Plays</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeTotalPlays}</Text>
              </View>

              <View className="bg-slate-50 dark:bg-[#0D1117] rounded-lg p-3 flex-row justify-between items-center mb-4">
                <Text className="text-[13px] text-slate-600 dark:text-slate-400 font-black uppercase">Max Estimated Cost</Text>
                <Text className="text-[18px] text-[#F59E0B] font-black">₹{safeCost.toFixed(2)}</Text>
              </View>
              
              {/* Disclaimer Callout */}
              <View className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg p-3 flex-row mb-4">
                <View className="mt-0.5 mr-2">
                  <Text className="text-sky-500">ℹ️</Text>
                </View>
                <Text className="flex-1 text-[12px] text-sky-700 dark:text-sky-300 font-medium leading-relaxed">
                  Actual deductions occur incrementally based on verified playbacks. This is the maximum expected cost.
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Current Wallet Balance</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[13px] text-slate-900 dark:text-white font-black">Balance After Deductions</Text>
                <Text className={\`text-[15px] font-black \${(safeWalletBalance - safeCost) < 0 ? 'text-red-500' : 'text-emerald-500'}\`}>
                  ₹{(safeWalletBalance - safeCost).toFixed(2)}
                </Text>
              </View>
            </View>

            {safeCost > safeWalletBalance && (`;

code = code.replace(step4Regex, newStep4);

// 3. Fix Bottom Action Bar & CTA
const oldBottomBar = `      <View className="px-5 py-4 bg-white dark:bg-[#0D1117] border-t border-slate-100 dark:border-[#1F2937]">
        <TouchableOpacity 
          onPress={step === 4 ? handleLaunch : handleNext}
          disabled={creating || (step === 1 && !form.ad) || (step === 2 && whereMode === 'custom' && form.routes.length === 0)}
          className={\`w-full py-4 rounded-2xl items-center shadow-md flex-row justify-center \${creating || (step === 1 && !form.ad) || (step === 2 && whereMode === 'custom' && form.routes.length === 0) ? 'bg-slate-200 dark:bg-[#30363D]' : 'bg-[#F59E0B] shadow-amber-500/20'}\`}
        >
          {creating ? (
            <ActivityIndicator color="#FFF" className="mr-2" />
          ) : null}
          <Text className="text-white font-black text-lg tracking-tight">
            {step === 4 ? (creating ? 'Launching...' : 'Launch Ad') : 'Next Step →'}
          </Text>
        </TouchableOpacity>
      </View>`;

const newBottomBar = `      <View className="px-5 pt-4 pb-8 bg-white dark:bg-[#0D1117] border-t border-slate-100 dark:border-[#1F2937]">
        <TouchableOpacity 
          onPress={step === 4 ? handleLaunch : handleNext}
          disabled={creating || (step === 1 && !form.ad) || (step === 2 && whereMode === 'custom' && form.routes.length === 0)}
          className={\`w-full py-4 rounded-2xl items-center shadow-md flex-row justify-center \${creating || (step === 1 && !form.ad) || (step === 2 && whereMode === 'custom' && form.routes.length === 0) ? 'bg-slate-200 dark:bg-[#30363D]' : (step === 4 ? 'bg-[#0F172A] shadow-slate-900/20' : 'bg-[#F59E0B] shadow-amber-500/20')}\`}
        >
          {creating ? (
            <ActivityIndicator color="#FFF" className="mr-2" />
          ) : null}
          <Text className="text-white font-black text-lg tracking-tight">
            {step === 4 ? (creating ? 'Launching...' : '🚀 Confirm & Launch Ad') : 'Next Step →'}
          </Text>
        </TouchableOpacity>
      </View>`;

code = code.replace(oldBottomBar, newBottomBar);

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('UI updates applied successfully');
