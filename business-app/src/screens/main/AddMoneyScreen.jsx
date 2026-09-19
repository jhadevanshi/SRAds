import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCircle2, IndianRupee, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function AddMoneyScreen({ route, navigation }) {
  const { isDark } = useTheme();
  const { checkAuth } = useAuth();
  const routeAmount = route.params?.amount;
  const [amount, setAmount] = useState(routeAmount?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const quickAmounts = ['500', '1000', '2000', '5000'];

  const validateAmount = (val) => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      return false;
    }
    return true;
  };

  const handleAddFunds = async () => {
    if (!validateAmount(amount)) {
      setError('Please enter an amount greater than ₹0.');
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
      setError('An error occurred while recharging wallet.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = amount ? parseFloat(amount) : 0;

  if (success) {
    return (
      <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1 justify-center items-center p-6" edges={['top']}>
        <LinearGradient
          colors={['#7C3AED', '#9333EA', '#C084FC']}
          className="w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg"
          style={{ shadowColor: '#9333EA', shadowRadius: 15, shadowOpacity: 0.4 }}
        >
          <CheckCircle2 size={42} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
        
        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black text-center tracking-tight mb-2">
          Funds Added Successfully!
        </Text>
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm leading-relaxed mb-8 px-4 font-medium">
          ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been instantly credited to your transit advertising balance.
        </Text>

        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="rounded-2xl overflow-hidden shadow-lg w-full"
          style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="py-4 items-center justify-center"
          >
            <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Return to Wallet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Top Header */}
        <View 
          style={{ 
            backgroundColor: isDark ? '#120C26' : '#FFFFFF',
            borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="flex-row justify-between items-center px-5 py-4 border-b"
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ 
              backgroundColor: isDark ? '#1F1735' : '#F8F7FF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="p-2 rounded-full border"
          >
            <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#1E1B4B'} />
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-lg font-black tracking-tight">Recharge Wallet</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" className="px-5 py-6">
          <View className="flex-1 justify-between">
            <View>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-4">
                Enter Amount to Add
              </Text>
              
              {/* Currency Input Field */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: error ? '#EF4444' : (isDark ? '#7C3AED' : '#C084FC') 
                }}
                className="flex-row items-center border-2 rounded-3xl px-5 py-3 mb-2 shadow-sm"
              >
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-3xl font-black mr-2">₹</Text>
                <TextInput
                  style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }}
                  className="text-3xl font-black flex-1 h-[54px]"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    setError('');
                  }}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  autoFocus
                />
              </View>

              {error ? (
                <Text className="text-rose-500 font-bold text-xs mb-4 ml-1">{error}</Text>
              ) : (
                <View className="h-4 mb-2" />
              )}

              {/* Quick Amount Chips */}
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-3">
                Quick Recharge Presets
              </Text>
              <View className="flex-row justify-between mb-6">
                {quickAmounts.map((qAmount) => {
                  const isSelected = amount === qAmount;
                  return (
                    <TouchableOpacity 
                      key={qAmount}
                      onPress={() => {
                        setAmount(qAmount);
                        setError('');
                      }}
                      style={{ 
                        backgroundColor: isSelected ? (isDark ? '#281B4B' : '#EDE9FE') : (isDark ? '#140F24' : '#FFFFFF'),
                        borderColor: isSelected ? '#A855F7' : (isDark ? '#281B4B' : '#EDE9FE')
                      }}
                      className="flex-1 mx-1 py-3 rounded-2xl border items-center justify-center shadow-sm"
                    >
                      <Text 
                        style={{ 
                          color: isSelected ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? '#F8FAFC' : '#1E1B4B'),
                          fontWeight: isSelected ? '900' : '700'
                        }}
                        className="text-xs"
                      >
                        +₹{parseInt(qAmount).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Transaction Summary Card */}
              {finalAmount > 0 && (
                <View 
                  style={{ 
                    backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                    borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                  }}
                  className="border rounded-2xl p-4 flex-row justify-between items-center mb-6 shadow-sm"
                >
                  <View>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Top-Up Amount</Text>
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-xl">
                      ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View 
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    className="px-3 py-1.5 rounded-full border"
                  >
                    <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">Instant Credit</Text>
                  </View>
                </View>
              )}

              {/* Trust Badge */}
              <View className="flex-row items-center justify-center p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10 mb-4">
                <ShieldCheck size={16} color="#A855F7" style={{ marginRight: 6 }} />
                <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">256-Bit Encrypted Razorpay / UPI Gateway</Text>
              </View>
            </View>

            {/* Bottom Actions */}
            <View className="pb-8">
              <TouchableOpacity 
                onPress={handleAddFunds}
                disabled={loading || finalAmount <= 0}
                className="rounded-2xl overflow-hidden shadow-lg w-full"
                style={{ 
                  shadowColor: '#9333EA', 
                  shadowRadius: 10,
                  opacity: (loading || finalAmount <= 0) ? 0.5 : 1 
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  className="py-4 items-center justify-center flex-row"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" className="mr-2" size="small" />
                  ) : null}
                  <Text className="text-white font-black text-sm uppercase tracking-wide">
                    {loading ? 'Processing...' : `Add ₹${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                className="py-3 w-full items-center justify-center mt-2"
                onPress={() => navigation.goBack()}
              >
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="font-bold text-xs uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
