import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCircle2, CreditCard, Smartphone, Building2, Sparkles, ShieldCheck } from 'lucide-react-native';
import { businessService } from '../services/business';
import { useTheme } from '../context/ThemeContext';

export default function AddFundsBottomSheet({ visible, requiredAmount, currentBalance, onClose, onSuccess }) {
  const { isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

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
      setError(`Minimum required top-up is ₹${requiredAmount.toFixed(2)}`);
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await businessService.addFundsDirect(amount);
      if (res.success) {
        const walletRes = await businessService.getWallet();
        if (walletRes.success) {
          setNewBalance(parseFloat(walletRes.wallet_balance || 0));
        } else {
          setNewBalance(currentBalance + num);
        }
        setSuccess(true);
      } else {
        setError(res.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to update wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = amount ? parseFloat(amount) : 0;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/75">
        
        <View 
          style={{ 
            backgroundColor: isDark ? '#140F24' : '#FFFFFF',
            borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="rounded-t-[32px] h-[85%] overflow-hidden border-t shadow-2xl"
        >
          
          {success ? (
            <View className="flex-1 justify-center items-center p-6">
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                className="w-20 h-20 rounded-3xl items-center justify-center mb-5 shadow-lg"
                style={{ shadowColor: '#9333EA', shadowRadius: 15 }}
              >
                <CheckCircle2 size={42} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
              
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight text-center mb-2">
                Funds Added Successfully!
              </Text>
              
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm font-medium mb-6 px-4">
                ₹{finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to your wallet.
              </Text>
              
              <View 
                style={{ 
                  backgroundColor: isDark ? '#0D091A' : '#F8F7FF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="border w-full rounded-2xl p-4 mb-8 shadow-sm items-center"
              >
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Updated Wallet Balance
                </Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-3xl font-black">
                  ₹{newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  setSuccess(false);
                  onSuccess();
                }}
                className="rounded-2xl overflow-hidden shadow-lg w-full"
                style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  className="py-4 items-center justify-center"
                >
                  <Text className="text-white font-extrabold text-sm uppercase tracking-wide">Continue Launching Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header */}
              <View 
                style={{ borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' }}
                className="flex-row justify-between items-center px-6 py-4 border-b"
              >
                <View>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">Top Up Wallet</Text>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Add funds for live campaign broadcast</Text>
                </View>
                <TouchableOpacity 
                  onPress={onClose} 
                  style={{ backgroundColor: isDark ? '#1F1735' : '#F1F5F9' }}
                  className="p-2 rounded-full"
                >
                  <X size={18} color={isDark ? '#CBD5E1' : '#475569'} />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-6 pt-5 pb-10">
                {/* Required Amount Display */}
                {requiredAmount > 0 && (
                  <View 
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)' }}
                    className="border rounded-2xl p-3.5 mb-5 flex-row justify-between items-center"
                  >
                    <Text className="text-amber-500 text-xs font-bold uppercase tracking-wider">Required for this flight</Text>
                    <Text className="text-amber-500 font-black text-base">₹{requiredAmount.toFixed(2)}</Text>
                  </View>
                )}

                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-2">
                  Amount
                </Text>

                {/* Amount Input */}
                <View 
                  style={{ 
                    backgroundColor: isDark ? '#181033' : '#F8F7FF',
                    borderColor: error ? '#EF4444' : (isDark ? '#7C3AED' : '#C084FC') 
                  }}
                  className="flex-row items-center border-2 rounded-2xl px-4 py-2 mb-2 shadow-sm"
                >
                  <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-2xl font-black mr-2">₹</Text>
                  <TextInput
                    style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }}
                    className="text-2xl font-black flex-1 h-[50px]"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      setError('');
                    }}
                    placeholder="Enter amount"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>

                {error ? (
                  <Text className="text-rose-500 font-bold text-xs mb-3 ml-1">{error}</Text>
                ) : (
                  <View className="h-3 mb-1" />
                )}

                {/* Quick Amount Chips */}
                <View className="flex-row justify-between mb-6">
                  {quickAmounts.map((qAmount) => (
                    <TouchableOpacity 
                      key={qAmount}
                      onPress={() => {
                        setAmount(qAmount);
                        setError('');
                      }}
                      style={{ 
                        backgroundColor: amount === qAmount ? (isDark ? '#281B4B' : '#EDE9FE') : (isDark ? '#181033' : '#F8F7FF'),
                        borderColor: amount === qAmount ? '#A855F7' : (isDark ? '#281B4B' : '#EDE9FE')
                      }}
                      className="flex-1 mx-1 py-2.5 rounded-xl border items-center shadow-sm"
                    >
                      <Text 
                        style={{ 
                          color: amount === qAmount ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? '#F8FAFC' : '#1E1B4B'),
                          fontWeight: amount === qAmount ? '900' : '700'
                        }}
                        className="text-xs"
                      >
                        +₹{qAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-3">
                  Payment Method
                </Text>

                {/* UPI */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('upi')}
                  style={{ 
                    backgroundColor: paymentMethod === 'upi' ? (isDark ? '#201642' : '#EDE9FE') : (isDark ? '#140F24' : '#FFFFFF'),
                    borderColor: paymentMethod === 'upi' ? '#7C3AED' : (isDark ? '#281B4B' : '#EDE9FE')
                  }}
                  className="flex-row items-center p-3.5 rounded-2xl border mb-2.5 shadow-sm"
                >
                  <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Smartphone size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">UPI Instant Transfer</Text>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px]">Google Pay / PhonePe / Paytm / BHIM</Text>
                  </View>
                  <View 
                    style={{ 
                      borderColor: paymentMethod === 'upi' ? '#7C3AED' : (isDark ? '#3B2A68' : '#CBD5E1'),
                      backgroundColor: paymentMethod === 'upi' ? '#7C3AED' : 'transparent' 
                    }}
                    className="w-5 h-5 rounded-full border-2 items-center justify-center"
                  >
                    {paymentMethod === 'upi' && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>

                {/* Cards */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('card')}
                  style={{ 
                    backgroundColor: paymentMethod === 'card' ? (isDark ? '#201642' : '#EDE9FE') : (isDark ? '#140F24' : '#FFFFFF'),
                    borderColor: paymentMethod === 'card' ? '#7C3AED' : (isDark ? '#281B4B' : '#EDE9FE')
                  }}
                  className="flex-row items-center p-3.5 rounded-2xl border mb-2.5 shadow-sm"
                >
                  <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <CreditCard size={20} color="#38BDF8" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">Credit / Debit Cards</Text>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px]">Visa, Mastercard, RuPay</Text>
                  </View>
                  <View 
                    style={{ 
                      borderColor: paymentMethod === 'card' ? '#7C3AED' : (isDark ? '#3B2A68' : '#CBD5E1'),
                      backgroundColor: paymentMethod === 'card' ? '#7C3AED' : 'transparent' 
                    }}
                    className="w-5 h-5 rounded-full border-2 items-center justify-center"
                  >
                    {paymentMethod === 'card' && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>

                {/* Net Banking */}
                <TouchableOpacity 
                  onPress={() => setPaymentMethod('netbanking')}
                  style={{ 
                    backgroundColor: paymentMethod === 'netbanking' ? (isDark ? '#201642' : '#EDE9FE') : (isDark ? '#140F24' : '#FFFFFF'),
                    borderColor: paymentMethod === 'netbanking' ? '#7C3AED' : (isDark ? '#281B4B' : '#EDE9FE')
                  }}
                  className="flex-row items-center p-3.5 rounded-2xl border mb-6 shadow-sm"
                >
                  <View style={{ backgroundColor: 'rgba(217, 70, 239, 0.12)' }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Building2 size={20} color="#D946EF" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">Net Banking</Text>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px]">HDFC, ICICI, SBI, Axis & all major banks</Text>
                  </View>
                  <View 
                    style={{ 
                      borderColor: paymentMethod === 'netbanking' ? '#7C3AED' : (isDark ? '#3B2A68' : '#CBD5E1'),
                      backgroundColor: paymentMethod === 'netbanking' ? '#7C3AED' : 'transparent' 
                    }}
                    className="w-5 h-5 rounded-full border-2 items-center justify-center"
                  >
                    {paymentMethod === 'netbanking' && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              </ScrollView>

              {/* Bottom Pay CTA */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#120C26' : '#FFFFFF',
                  borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="p-5 border-t"
              >
                <TouchableOpacity 
                  onPress={handlePay}
                  disabled={loading || finalAmount <= 0}
                  className="rounded-2xl overflow-hidden shadow-lg"
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
                      {loading ? 'Processing...' : `Pay ₹${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} →`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
