import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, CheckCircle2, Info } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';

export default function AddMoneyScreen({ route, navigation }) {
  const { checkAuth } = useAuth();
  const routeAmount = route.params?.amount;
  const [amount, setAmount] = useState(routeAmount?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const quickAmounts = ['500', '1000', '2000'];

  const validateAmount = (val) => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      return false;
    }
    return true;
  };

  const handleAddFunds = async () => {
    if (!validateAmount(amount)) {
      setError('Enter an amount greater than ₹0.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await businessService.addFundsDirect(amount);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to add funds.');
      }
    } catch (err) {
      setError('An error occurred while adding funds.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = amount ? parseFloat(amount) : 0;

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117] justify-center items-center p-6" edges={['top']}>
        <CheckCircle2 size={64} className="text-emerald-500 mb-6" />
        <Text className="text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-3">
          Funds Added Successfully
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-10 px-4">
          ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to your advertising wallet.
        </Text>

        <TouchableOpacity 
          className="bg-[#F59E0B] py-4 rounded-2xl w-full flex-row justify-center items-center shadow-lg shadow-amber-500/20"
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-black text-base tracking-tight">Return to Wallet</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0D1117]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <X size={20} className="text-slate-500 dark:text-[#8B949E]" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Add Funds</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" className="px-5 py-6">
          <View className="flex-1 justify-between">
            <View>
              <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
                How much would you like to add?
              </Text>
              
              {/* Currency Input Field */}
              <View className={`flex-row items-center border-2 ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/5' : 'border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]'} rounded-[20px] px-4 py-2.5 mb-2 shadow-sm`}>
                <Text className={`text-2xl font-black ${error ? 'text-red-500' : 'text-slate-900 dark:text-white'} mr-1.5`}>₹</Text>
                <TextInput
                  className={`text-2xl font-black ${error ? 'text-red-500' : 'text-slate-900 dark:text-white'} flex-1 h-[54px]`}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setError('');
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                />
              </View>

              {error ? (
                <Text className="text-red-500 font-bold text-xs mb-6 ml-1">{error}</Text>
              ) : (
                <View className="h-[20px] mb-4" />
              )}

              {/* Quick Amount Chips */}
              <Text className="text-slate-450 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Quick amount chips</Text>
              <View className="flex-row justify-between mb-8">
                {quickAmounts.map((qAmount) => {
                  const isSelected = amount === qAmount;
                  return (
                    <TouchableOpacity 
                      key={qAmount}
                      onPress={() => {
                        setAmount(qAmount);
                        setError('');
                      }}
                      className={`flex-1 mx-1.5 py-3 rounded-2xl border items-center justify-center shadow-sm ${isSelected ? 'bg-amber-50 dark:bg-amber-500/10 border-[#F59E0B]' : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#30363D]'}`}
                    >
                      <Text className={`font-black text-sm ${isSelected ? 'text-[#F59E0B]' : 'text-slate-700 dark:text-slate-300'}`}>
                        +₹{parseInt(qAmount).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Transaction Summary Card */}
              {finalAmount > 0 && (
                <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4 flex-row justify-between items-center mb-8 shadow-sm">
                  <View>
                    <Text className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-wider mb-0.5">Amount to add</Text>
                    <Text className="text-slate-900 dark:text-white font-black text-lg">
                      ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                    <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">Ready to Top-up</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom Actions */}
            <View className="pb-8">
              <TouchableOpacity 
                className={`py-4 w-full rounded-2xl flex-row justify-center items-center shadow-sm ${loading ? 'bg-amber-400' : 'bg-[#F59E0B]'}`}
                onPress={handleAddFunds}
                disabled={loading || finalAmount <= 0}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-black text-base tracking-tight">
                    Add ₹{finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                className="py-4 w-full rounded-2xl flex-row justify-center items-center mt-2"
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
