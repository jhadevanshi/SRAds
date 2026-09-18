import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { X, CheckCircle2, CreditCard, Smartphone, Building2 } from 'lucide-react-native';
import { businessService } from '../services/business';

export default function AddFundsBottomSheet({ visible, requiredAmount, currentBalance, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  // Initialize with required amount if needed
  useEffect(() => {
    if (visible && requiredAmount > 0) {
      setAmount(Math.ceil(requiredAmount).toString());
      setSuccess(false);
      setError('');
    }
  }, [visible, requiredAmount]);

  const quickAmounts = ['500', '1000', '2000', '5000'];

  const validateAmount = (val) => {
    const num = parseFloat(val);
    if (!val || isNaN(num) || num <= 0) {
      return false;
    }
    if (requiredAmount > 0 && num < requiredAmount) {
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    const num = parseFloat(amount);
    if (!validateAmount(amount)) {
      setError(`Minimum required is ₹${requiredAmount.toFixed(2)}`);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // Reusing the existing API from businessService
      const res = await businessService.addFundsDirect(amount);
      if (res.success) {
        // Fetch latest balance from backend as requested
        const walletRes = await businessService.getWallet();
        if (walletRes.success) {
          setNewBalance(parseFloat(walletRes.wallet_balance || 0));
        } else {
          // Fallback if fetch fails, but user top-up succeeded
          setNewBalance(currentBalance + num);
        }
        setSuccess(true);
      } else {
        setError(res.message || 'Payment Failed. We couldn\'t add funds to your wallet. Please try again.');
      }
    } catch (err) {
      setError('Unable to update wallet. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = amount ? parseFloat(amount) : 0;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
        
        <View className="bg-white dark:bg-[#0D1117] rounded-t-3xl h-[85%] overflow-hidden shadow-2xl">
          
          {success ? (
            <View className="flex-1 justify-center items-center p-6">
              <CheckCircle2 size={80} className="text-emerald-500 mb-6" />
              <Text className="text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-3">
                Funds Added Successfully
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-8 px-4">
                ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to your wallet.
              </Text>
              
              <View className="bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] w-full rounded-2xl p-5 mb-10 shadow-sm items-center">
                <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  New Wallet Balance
                </Text>
                <Text className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <TouchableOpacity 
                className="bg-[#F59E0B] py-4 rounded-2xl w-full flex-row justify-center items-center shadow-lg shadow-amber-500/20"
                onPress={() => {
                  setSuccess(false);
                  onSuccess();
                }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-black text-lg tracking-tight">Continue Launching Ad</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header */}
              <View className="flex-row justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-[#1F2937]">
                <View>
                  <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Funds</Text>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-xs mt-1">Add money to your wallet to launch this ad.</Text>
                </View>
                <TouchableOpacity onPress={onClose} className="bg-slate-50 dark:bg-[#161B22] p-2 rounded-full border border-slate-200 dark:border-[#30363D]">
                  <X size={20} className="text-slate-500 dark:text-[#8B949E]" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-6 pt-6 pb-20">
                {/* Required Amount Display */}
                {requiredAmount > 0 && (
                  <View className="bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 mb-6 flex-row justify-between items-center shadow-sm">
                    <Text className="text-amber-700 dark:text-amber-500 text-xs font-black uppercase tracking-wider">Required for this ad</Text>
                    <Text className="text-amber-700 dark:text-amber-500 font-black text-lg">₹{requiredAmount.toFixed(2)}</Text>
                  </View>
                )}

                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">
                  Amount
                </Text>

                {/* Amount Input */}
                <View className={`flex-row items-center border-2 ${error ? 'border-red-500 bg-red-50 dark:bg-red-500/5' : 'border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]'} rounded-2xl px-4 py-2 mb-2 shadow-sm`}>
                  <Text className={`text-2xl font-black ${error ? 'text-red-500' : 'text-slate-900 dark:text-white'} mr-1.5`}>₹</Text>
                  <TextInput
                    className={`text-2xl font-black ${error ? 'text-red-500' : 'text-slate-900 dark:text-white'} flex-1 h-[54px]`}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      setError('');
                    }}
                    placeholder="Enter custom amount"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {error ? (
                  <Text className="text-red-500 font-bold text-xs mb-4 ml-1">{error}</Text>
                ) : (
                  <View className="h-4 mb-2" />
                )}

                {/* Quick Amount Chips */}
                <View className="flex-row justify-between mb-8">
                  {quickAmounts.map((qAmount) => (
                    <TouchableOpacity 
                      key={qAmount}
                      onPress={() => {
                        setAmount(qAmount);
                        setError('');
                      }}
                      className={`flex-1 mx-1 py-3 rounded-xl border items-center shadow-sm ${amount === qAmount ? 'bg-amber-50 dark:bg-amber-500/10 border-[#F59E0B]' : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#30363D]'}`}
                    >
                      <Text className={`font-black text-sm ${amount === qAmount ? 'text-[#F59E0B]' : 'text-slate-700 dark:text-slate-300'}`}>
                        +₹{qAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-6" />

                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                  Select Payment Method
                </Text>

                {/* Payment Methods */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('upi')}
                  className={`flex-row items-center p-4 rounded-2xl border mb-3 shadow-sm ${paymentMethod === 'upi' ? 'bg-[#F8FAFC] dark:bg-[#161B22] border-[#F59E0B]' : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D]'}`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${paymentMethod === 'upi' ? 'border-[#F59E0B]' : 'border-slate-300 dark:border-slate-600'}`}>
                    {paymentMethod === 'upi' && <View className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />}
                  </View>
                  <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-3">
                    <Smartphone size={20} className="text-emerald-500" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-black text-sm">UPI</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">GPay / PhonePe / Paytm</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setPaymentMethod('card')}
                  className={`flex-row items-center p-4 rounded-2xl border mb-3 shadow-sm ${paymentMethod === 'card' ? 'bg-[#F8FAFC] dark:bg-[#161B22] border-[#F59E0B]' : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D]'}`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${paymentMethod === 'card' ? 'border-[#F59E0B]' : 'border-slate-300 dark:border-slate-600'}`}>
                    {paymentMethod === 'card' && <View className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />}
                  </View>
                  <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full items-center justify-center mr-3">
                    <CreditCard size={20} className="text-blue-500" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-black text-sm">Credit / Debit Card</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">Visa, Mastercard, RuPay</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setPaymentMethod('netbanking')}
                  className={`flex-row items-center p-4 rounded-2xl border mb-8 shadow-sm ${paymentMethod === 'netbanking' ? 'bg-[#F8FAFC] dark:bg-[#161B22] border-[#F59E0B]' : 'bg-white dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D]'}`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-4 ${paymentMethod === 'netbanking' ? 'border-[#F59E0B]' : 'border-slate-300 dark:border-slate-600'}`}>
                    {paymentMethod === 'netbanking' && <View className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />}
                  </View>
                  <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full items-center justify-center mr-3">
                    <Building2 size={20} className="text-indigo-500" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-900 dark:text-white font-black text-sm">Net Banking</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">All major Indian banks</Text>
                  </View>
                </TouchableOpacity>
                <View className="h-10" />
              </ScrollView>

              {/* Bottom Pay CTA */}
              <View className="p-5 border-t border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117]">
                <TouchableOpacity 
                  className={`py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-amber-500/20 ${loading || finalAmount <= 0 ? 'bg-amber-400' : 'bg-[#F59E0B]'}`}
                  onPress={handlePay}
                  disabled={loading || finalAmount <= 0}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" className="mr-2" />
                  ) : null}
                  <Text className="text-white font-black text-lg tracking-tight">
                    {loading ? 'Processing...' : `Pay ₹${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} via ${paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking'} →`}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
