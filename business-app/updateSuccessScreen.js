const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

const oldSuccessStep = `  // SUCCESS STEP (Step 6)
  if (step === 6) {
    return (
      <SafeAreaView className="flex-1 bg-emerald-500 justify-center px-6">
        <View className="bg-white rounded-[32px] p-8 items-center shadow-xl shadow-emerald-900/20">
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </View>
          <Text className="text-3xl font-black text-slate-900 text-center mb-2 tracking-tight">Ad Submitted!</Text>
          <Text className="text-slate-500 text-center font-medium leading-relaxed mb-8">
            Your advertisement "{form.ad?.title}" has been successfully submitted and is awaiting approval. It will start playing once approved by the administrator.
          </Text>
          
          <View className="w-full bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500 font-bold text-xs uppercase">Status</Text>
              <Text className="text-amber-500 font-black text-xs uppercase">● Pending Approval</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500 font-bold text-xs uppercase">Where</Text>
              <Text className="text-slate-900 font-bold">{whereMode === 'everywhere' ? 'Everywhere' : \`\${form.routes.length} Location(s)\`}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500 font-bold text-xs uppercase">Schedule</Text>
              <Text className="text-slate-900 font-bold">{formatDate(startDate)} to {formatDate(endDate)}</Text>
            </View>
            <View className="flex-row justify-between border-t border-slate-200 pt-2 mt-2">
              <Text className="text-slate-500 font-bold text-xs uppercase">Estimated Cost</Text>
              <Text className="text-slate-900 font-bold">₹{safeCost.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('MainTabs', { screen: 'My Ads' })}
            className="w-full bg-[#F59E0B] py-4 rounded-2xl items-center shadow-md shadow-amber-500/20 mb-3"
          >
            <Text className="text-white font-black text-lg tracking-tight">View My Ad</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            className="w-full bg-slate-100 py-4 rounded-2xl items-center border border-slate-200"
          >
            <Text className="text-slate-700 font-bold text-base">Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }`;

const newSuccessStep = `  // SUCCESS STEP (Step 6)
  if (step === 6) {
    // Dynamic status support for reusability (currently defaults to pending post-submission)
    const adStatus = 'pending'; // could be 'approved', 'rejected', 'pending'
    const locationsText = whereMode === 'everywhere' ? 'Everywhere' : \`\${form.routes.length} location\${form.routes.length > 1 ? 's' : ''}\`;
    
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
        <ScrollView className="flex-1 px-6 pt-10 pb-20">
          
          {/* HERO SECTION */}
          <View className="items-center mb-10">
            {adStatus === 'rejected' ? (
              <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4 shadow-sm">
                <Text className="text-red-500 text-3xl">⚠️</Text>
              </View>
            ) : adStatus === 'approved' ? (
              <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4 shadow-sm shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-800/50">
                <Text className="text-emerald-500 text-3xl">🎉</Text>
              </View>
            ) : (
              <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4 shadow-sm shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
              </View>
            )}

            <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">
              {adStatus === 'rejected' ? 'Ad needs changes' : 
               adStatus === 'approved' ? 'Your ad is approved' : 
               'Your ad is submitted'}
            </Text>
            
            <Text className="text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed px-4">
              {adStatus === 'rejected' ? \`"\${form.ad?.title}" could not be approved based on our guidelines. Please edit and resubmit.\` : 
               adStatus === 'approved' ? \`"\${form.ad?.title}" is approved and ready to play on your scheduled dates.\` : 
               \`"\${form.ad?.title}" has been submitted successfully and is waiting for admin approval.\`}
            </Text>
          </View>

          {/* STATUS CARD */}
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Text className={\`text-lg mr-2 \${adStatus === 'rejected' ? 'text-red-500' : adStatus === 'approved' ? 'text-emerald-500' : 'text-[#F59E0B]'}\`}>●</Text>
              <Text className="text-slate-900 dark:text-white font-black tracking-tight uppercase text-sm">
                {adStatus === 'rejected' ? 'Action Required' : 
                 adStatus === 'approved' ? 'Ready to Play' : 
                 'Pending Approval'}
              </Text>
            </View>
            
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
              {adStatus === 'rejected' ? 'Your advertisement requires edits before it can be played.' : 
               adStatus === 'approved' ? 'Your advertisement will automatically play according to schedule.' : 
               'Your advertisement is being reviewed by our administrator.'}
            </Text>

            {/* Timeline */}
            <View className="ml-2">
              <View className="flex-row items-center mb-4">
                <View className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center z-10 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </View>
                <Text className="ml-3 text-slate-700 dark:text-slate-300 font-bold text-sm">Submitted</Text>
              </View>
              
              <View className="absolute left-[9px] top-4 w-[2px] h-10 bg-slate-200 dark:bg-slate-700" />
              
              <View className="flex-row items-center mb-4">
                <View className={\`w-5 h-5 rounded-full items-center justify-center z-10 border \${
                  adStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 
                  adStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 
                  'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                }\`}>
                  {adStatus === 'approved' ? (
                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  ) : adStatus === 'rejected' ? (
                    <Text className="text-red-500 font-black text-[10px]">!</Text>
                  ) : (
                    <View className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </View>
                <Text className={\`ml-3 font-bold text-sm \${adStatus === 'pending' ? 'text-[#F59E0B]' : 'text-slate-700 dark:text-slate-300'}\`}>
                  {adStatus === 'rejected' ? 'Review Failed' : 
                   adStatus === 'approved' ? 'Approved' : 'Under Review'}
                </Text>
              </View>
              
              <View className="absolute left-[9px] top-[52px] w-[2px] h-10 bg-slate-200 dark:bg-slate-700" />
              
              <View className="flex-row items-center">
                <View className={\`w-5 h-5 rounded-full items-center justify-center z-10 border \${adStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-[#0D1117] border-slate-300 dark:border-slate-600'}\`}>
                  {adStatus === 'approved' && <View className="w-2 h-2 rounded-full bg-emerald-500" />}
                </View>
                <Text className={\`ml-3 font-bold text-sm \${adStatus === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}\`}>Ready to Play</Text>
              </View>
            </View>
          </View>

          {/* AD DETAILS CARD */}
          <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest mb-3 ml-1">Advertisement Details</Text>
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-8 shadow-sm">
            <View className="flex-row justify-between mb-4 items-center">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Advertisement</Text>
              <Text className="text-slate-900 dark:text-white font-black text-[14px]">{form.ad?.title}</Text>
            </View>
            
            <View className="flex-row justify-between mb-4 items-center">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Locations</Text>
              <Text className="text-slate-900 dark:text-white font-black text-[14px]">{locationsText}</Text>
            </View>
            
            <View className="flex-row justify-between mb-5">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Schedule</Text>
              <View className="items-end">
                <Text className="text-slate-900 dark:text-white font-black text-[14px]">{formatDate(startDate)} →</Text>
                <Text className="text-slate-900 dark:text-white font-black text-[14px]">{formatDate(endDate)}</Text>
              </View>
            </View>
            
            <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-5" />
            
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-600 dark:text-slate-300 font-black text-[13px]">Estimated campaign cost</Text>
              <Text className="text-slate-900 dark:text-white font-black text-lg">₹{safeCost.toFixed(2)}</Text>
            </View>
          </View>

          {/* WHAT HAPPENS NEXT */}
          {adStatus === 'pending' && (
            <View className="mb-10 px-1">
              <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4">What happens next?</Text>
              
              <View className="flex-row items-start mb-3">
                <CheckCircle2 size={16} className="text-emerald-500 mr-3 mt-0.5" />
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Your ad has been submitted</Text>
              </View>
              
              <View className="flex-row items-start mb-3">
                <Text className="text-amber-500 mr-3 text-sm mt-0.5">●</Text>
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Our administrator reviews it</Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mr-3 mt-0.5" />
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Once approved, it starts playing automatically</Text>
              </View>
            </View>
          )}

          {/* BUTTONS */}
          <View className="gap-3 pb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'My Ads' })}
              className="w-full bg-[#F59E0B] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-amber-500/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-black text-base tracking-tight">
                {adStatus === 'rejected' ? 'Edit Ad Details →' : 'View Ad Details →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              className="w-full bg-white dark:bg-[#161B22] py-4 rounded-2xl items-center border border-slate-200 dark:border-[#30363D]"
              activeOpacity={0.8}
            >
              <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm tracking-tight">Go to Home</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    );
  }`;

if (code.includes('// SUCCESS STEP (Step 6)')) {
    code = code.replace(oldSuccessStep, newSuccessStep);
    fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
    console.log('Success screen updated perfectly.');
} else {
    console.log('Could not find success step.');
}
