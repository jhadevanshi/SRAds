const fs = require('fs');
let code = fs.readFileSync('src/screens/main/CreateCampaignScreen.jsx', 'utf8');

// 1. Add AddFundsBottomSheet import
const importTarget = "import VideoTrimmer from '../../components/VideoTrimmer';";
if (!code.includes('AddFundsBottomSheet')) {
    code = code.replace(importTarget, importTarget + "\nimport AddFundsBottomSheet from '../../components/AddFundsBottomSheet';\nimport { CheckCircle2 } from 'lucide-react-native';");
}

// 2. Add addFundsVisible state
const stateTarget = "const [videoTrimmerVisible, setVideoTrimmerVisible] = useState(false);";
if (!code.includes('addFundsVisible')) {
    code = code.replace(stateTarget, stateTarget + "\n  const [addFundsVisible, setAddFundsVisible] = useState(false);");
}

// 3. Update the Wallet Row logic inside Card 2
const oldWalletRow = `<View className="flex-row justify-between items-center mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Current Wallet Balance</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[13px] text-slate-900 dark:text-white font-black">Balance After Deductions</Text>
                <Text className={\`text-[16px] font-black \${(safeWalletBalance - safeCost) < 0 ? 'text-red-500' : 'text-emerald-500'}\`}>
                  ₹{(safeWalletBalance - safeCost).toFixed(2)}
                </Text>
              </View>`;

const newWalletRow = `<View className="flex-row justify-between items-center mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Current Wallet Balance</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>
              
              {safeCost > safeWalletBalance ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-[13px] text-red-500 font-black">Additional Funds Required</Text>
                  <Text className="text-[16px] font-black text-red-500">
                    ₹{(safeCost - safeWalletBalance).toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-between items-center">
                  <Text className="text-[13px] text-slate-900 dark:text-white font-black">Balance After Launch</Text>
                  <Text className="text-[16px] font-black text-emerald-500">
                    ₹{(safeWalletBalance - safeCost).toFixed(2)}
                  </Text>
                </View>
              )}`;

if (code.includes('Balance After Deductions')) {
    code = code.replace(oldWalletRow, newWalletRow);
}

// 4. Update the red warning box
const oldWarningBox = `{safeCost > safeWalletBalance && (
              <View className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-900/50">
                <Text className="text-red-600 dark:text-red-400 font-bold text-center">
                  Your estimated cost exceeds your wallet balance. Please add funds to proceed.
                </Text>
              </View>
            )}`;

const newWarningBox = `{safeCost > safeWalletBalance ? (
              <View className="mt-2 bg-white dark:bg-[#161B22] border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-5 mb-5 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <Text className="text-red-500 mr-2 text-lg">⚠️</Text>
                  <Text className="text-slate-900 dark:text-white font-black text-base">Additional funds required</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[13px] text-slate-500 font-bold">Estimated Cost</Text>
                  <Text className="text-[14px] text-slate-900 dark:text-white font-black">₹{safeCost.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-[13px] text-slate-500 font-bold">Wallet Balance</Text>
                  <Text className="text-[14px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
                </View>
                
                <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />
                
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-[13px] text-red-500 font-black">Required</Text>
                  <Text className="text-[16px] text-red-500 font-black">₹{(safeCost - safeWalletBalance).toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => setAddFundsVisible(true)}
                  className="bg-[#F59E0B] py-3.5 rounded-xl w-full flex-row justify-center items-center shadow-md shadow-amber-500/20"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-black text-sm tracking-tight">+ Add Funds</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mt-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-2xl p-4 mb-5 flex-row items-center">
                <CheckCircle2 size={20} className="text-emerald-500 mr-3" />
                <Text className="text-emerald-700 dark:text-emerald-400 font-black text-sm flex-1">
                  ✓ Wallet balance is sufficient
                </Text>
              </View>
            )}`;

if (code.includes('Please add funds to proceed.')) {
    code = code.replace(oldWarningBox, newWarningBox);
}

// 5. Inject the AddFundsBottomSheet before the final </SafeAreaView>
const addFundsModal = `
      <AddFundsBottomSheet
        visible={addFundsVisible}
        requiredAmount={Math.max(safeCost - safeWalletBalance, 0)}
        currentBalance={safeWalletBalance}
        onClose={() => setAddFundsVisible(false)}
        onSuccess={async () => {
          setAddFundsVisible(false);
          // Refresh the wallet balance so the Launch button unlocks instantly
          const walletRes = await businessService.getWallet().catch(() => ({ success: false }));
          if (walletRes.success) {
            setWalletBalance(parseFloat(walletRes.wallet_balance || 0));
          }
        }}
      />
`;

if (!code.includes('<AddFundsBottomSheet')) {
    code = code.replace(/<\/SafeAreaView>[\s]*\);[\s]*\}\s*$/, addFundsModal + "\n    </SafeAreaView>\n  );\n}");
}

// 6. Update Bottom Button CTA to respect prompt logic
const oldBottomCTA = `{creating ? 'Launching...' : '🚀 Confirm & Launch Ad'}`;
const newBottomCTA = `{creating ? 'Launching...' : (safeCost > safeWalletBalance ? 'Confirm & Launch Ad' : '🚀 Confirm & Launch Ad')}`;

if (code.includes(oldBottomCTA)) {
    code = code.replace(oldBottomCTA, newBottomCTA);
}

fs.writeFileSync('src/screens/main/CreateCampaignScreen.jsx', code);
console.log('Successfully updated wallet UI in Review step');
