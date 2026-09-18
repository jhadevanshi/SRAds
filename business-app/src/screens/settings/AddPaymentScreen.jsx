import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function AddPaymentScreen({ navigation }) {
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
      Alert.alert('Validation Error', 'Please enter a valid UPI ID');
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
      <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider mb-2 ml-1">{label}</Text>
      <TextInput
        className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border border-slate-200 dark:border-[#30363D] rounded-2xl px-5 py-4 font-bold shadow-sm"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
            <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Payment Method</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Type Selector */}
        <View className="flex-row bg-slate-200/50 dark:bg-[#161B22] p-1 rounded-full mb-8 border border-slate-200 dark:border-[#30363D]">
          {['UPI', 'Bank'].map(p => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.8}
              className={`flex-1 py-3 rounded-full items-center ${methodType === p ? 'bg-white dark:bg-[#F59E0B] shadow-sm' : ''}`}
              onPress={() => setMethodType(p)}
            >
              <Text className={`font-black text-xs uppercase tracking-wider ${methodType === p ? 'text-slate-900 dark:text-black' : 'text-slate-500 dark:text-[#8B949E]'}`}>
                {p === 'Bank' ? 'Bank Account' : 'UPI ID'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {methodType === 'UPI' ? (
          <>
            <InputField label="UPI ID *" placeholder="e.g. yourname@upi" value={form.upiId} onChangeText={(t) => setForm({...form, upiId: t})} />
          </>
        ) : (
          <>
            <InputField label="Account Holder Name *" placeholder="As per bank records" value={form.accountHolder} onChangeText={(t) => setForm({...form, accountHolder: t})} />
            <InputField label="Account Number *" placeholder="Enter Account Number" value={form.accountNumber} onChangeText={(t) => setForm({...form, accountNumber: t})} keyboardType="number-pad" />
            <InputField label="IFSC Code *" placeholder="e.g. HDFC0001234" value={form.ifsc} onChangeText={(t) => setForm({...form, ifsc: t})} />
            <InputField label="Bank Name" placeholder="e.g. HDFC Bank" value={form.bankName} onChangeText={(t) => setForm({...form, bankName: t})} />
          </>
        )}

      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-[#F8FAFC]/90 dark:bg-[#0D1117]/90 border-t border-slate-100 dark:border-[#30363D]">
        <TouchableOpacity 
          className="bg-[#F59E0B] rounded-2xl py-4 items-center shadow-md shadow-amber-500/20"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-black text-lg tracking-tight">Verify & Save</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
