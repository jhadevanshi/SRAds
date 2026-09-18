const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// 1. HEADER & PROGRESS BAR
const oldHeader = `      {/* Header */}
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

const newHeader = `      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
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
      <View className="px-4 py-4 bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-[#1F2937]">
        <View className="flex-row justify-between">
          {['Ad', 'Where', 'Schedule', 'Review'].map((label, idx) => (
            <View key={label} className="flex-1 px-1">
              <View className={\`h-1 rounded-full w-full mb-2 \${step >= idx + 1 ? 'bg-[#F59E0B]' : 'bg-slate-100 dark:bg-[#30363D]'}\`} />
              <Text className={\`text-[10px] font-black uppercase text-center \${step >= idx + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#8B949E]'}\`}>{label}</Text>
            </View>
          ))}
        </View>
      </View>`;

code = code.replace(oldHeader, newHeader);


// 2. BOTTOM ACTION BAR
const oldBottom = `      {/* Bottom Action Bar */}
      <View className="px-5 py-4 border-t border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] flex-row">
        {step === 5 ? (
          <TouchableOpacity 
            onPress={handleLaunch} 
            disabled={creating}
            className={\`flex-1 \${creating ? 'bg-amber-400' : 'bg-[#F59E0B]'} py-4 rounded-full items-center shadow-lg shadow-amber-500/30\`}
          >
            {creating ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-black text-lg tracking-tight">Launch Advertisement</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={uploadMode && uploading}
            className="flex-1 bg-slate-900 py-4 rounded-full items-center shadow-md"
          >
            <Text className="text-white font-black text-lg tracking-tight">Next Step</Text>
          </TouchableOpacity>
        )}
      </View>`;

const newBottom = `      {/* Bottom Action Bar */}
      <View className="px-5 pt-4 pb-8 border-t border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] flex-row">
        {step === 4 ? (
          <TouchableOpacity 
            onPress={handleLaunch} 
            disabled={creating || safeCost > safeWalletBalance}
            className={\`flex-1 \${creating || safeCost > safeWalletBalance ? 'bg-slate-200 dark:bg-slate-700' : 'bg-[#0F172A] dark:bg-slate-800'} py-4 rounded-full flex-row items-center justify-center shadow-md\`}
          >
            {creating ? <ActivityIndicator color="#FFFFFF" className="mr-2" /> : null}
            <Text className={\`font-black text-lg tracking-tight \${creating || safeCost > safeWalletBalance ? 'text-slate-400' : 'text-white'}\`}>
              {creating ? 'Launching...' : '🚀 Confirm & Launch Ad'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={uploadMode && uploading}
            className="flex-1 bg-[#F59E0B] py-4 rounded-full items-center shadow-md shadow-amber-500/30"
          >
            <Text className="text-white font-black text-lg tracking-tight">Next Step</Text>
          </TouchableOpacity>
        )}
      </View>`;

code = code.replace(oldBottom, newBottom);

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('UI updates for header and footer applied');
