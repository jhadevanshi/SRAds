import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ArrowLeft, ShieldCheck, Smartphone, Building2 } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function AddPaymentScreen({ navigation }) {
  const { isDark } = useTheme();
  const [methodType, setMethodType] = useState('UPI'); // UPI, Bank
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: ''
  });

  const handleSave = async () => {
    if (methodType === 'UPI' && !form.upiId) {
      Alert.alert('Validation Error', 'Please enter a valid UPI ID (e.g. yourname@okaxis)');
      return;
    }
    if (methodType === 'Bank' && (!form.accountNumber || !form.ifsc)) {
      Alert.alert('Validation Error', 'Please fill in all bank details');
      return;
    }

    setSaving(true);
    try {
      const res = await businessService.addPaymentMethod(form);
      if (res.success) {
        Alert.alert('Success', 'Payment method added successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View className="mb-4">
      <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-2 ml-1">
        {label}
      </Text>
      <TextInput
        style={{ 
          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
          borderColor: isDark ? '#281B4B' : '#EDE9FE',
          color: isDark ? '#F8FAFC' : '#1E1B4B' 
        }}
        className="border rounded-2xl px-4 py-3.5 font-semibold text-sm shadow-sm"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      {/* Header */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="px-5 py-4 border-b z-10 flex-row items-center"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            backgroundColor: isDark ? '#1F1735' : '#F8F7FF',
            borderColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="p-2.5 rounded-full border mr-3"
        >
          <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#1E1B4B'} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">
            Add Payment Method
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">
            Link UPI ID or Corporate Bank Account
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 110 }}>
        
        {/* Method Switcher */}
        <View 
          style={{ 
            backgroundColor: isDark ? '#140F24' : '#F1F5F9',
            borderColor: isDark ? '#281B4B' : '#E2E8F0' 
          }}
          className="flex-row p-1 rounded-full mb-6 border"
        >
          {['UPI', 'Bank'].map(p => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.8}
              style={{
                backgroundColor: methodType === p ? '#7C3AED' : 'transparent',
              }}
              className="flex-1 py-3 rounded-full items-center flex-row justify-center"
              onPress={() => setMethodType(p)}
            >
              {p === 'UPI' ? (
                <Smartphone size={15} color={methodType === p ? '#FFF' : (isDark ? '#94A3B8' : '#64748B')} style={{ marginRight: 6 }} />
              ) : (
                <Building2 size={15} color={methodType === p ? '#FFF' : (isDark ? '#94A3B8' : '#64748B')} style={{ marginRight: 6 }} />
              )}
              <Text 
                style={{ 
                  color: methodType === p ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                  fontWeight: methodType === p ? '900' : '700' 
                }}
                className="text-xs uppercase tracking-wider"
              >
                {p === 'Bank' ? 'Bank Account' : 'UPI ID / VPA'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {methodType === 'UPI' ? (
          <>
            <InputField label="UPI Virtual Payment Address *" placeholder="e.g. yourbusiness@okaxis" value={form.upiId} onChangeText={(t) => setForm({...form, upiId: t})} />
            
            <View className="flex-row items-center p-3 rounded-2xl bg-purple-500/5 border border-purple-500/10 mt-2">
              <ShieldCheck size={16} color="#A855F7" style={{ marginRight: 6 }} />
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">Supports GPay, PhonePe, Paytm & BHIM handles</Text>
            </View>
          </>
        ) : (
          <>
            <InputField label="Account Holder / Corporate Entity *" placeholder="As registered in bank" value={form.accountHolder} onChangeText={(t) => setForm({...form, accountHolder: t})} />
            <InputField label="Account Number *" placeholder="Enter Account Number" value={form.accountNumber} onChangeText={(t) => setForm({...form, accountNumber: t})} keyboardType="number-pad" />
            <InputField label="Bank IFSC Code *" placeholder="e.g. HDFC0001234" value={form.ifsc} onChangeText={(t) => setForm({...form, ifsc: t})} />
            <InputField label="Bank Name" placeholder="e.g. HDFC Bank Ltd" value={form.bankName} onChangeText={(t) => setForm({...form, bankName: t})} />
          </>
        )}

      </ScrollView>

      {/* Bottom Save */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="p-5 border-t"
      >
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ shadowColor: '#9333EA', shadowRadius: 10, opacity: saving ? 0.6 : 1 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="py-4 items-center justify-center flex-row"
          >
            {saving ? <ActivityIndicator color="#FFFFFF" className="mr-2" size="small" /> : null}
            <Text className="text-white font-black text-sm uppercase tracking-wide">Verify & Save Method</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
