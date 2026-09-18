import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';

export default function AddBankScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    confirmNumber: '',
    ifsc: '',
    bankName: '',
    branch: ''
  });

  const handleSave = async () => {
    if (!formData.accountHolder || !formData.accountNumber || !formData.ifsc || !formData.bankName) {
      return Alert.alert('Error', 'Please fill in all required fields.');
    }
    if (formData.accountNumber !== formData.confirmNumber) {
      return Alert.alert('Error', 'Account numbers do not match.');
    }

    setLoading(true);
    try {
      await api.post('/driver/payment-methods', formData);
      Alert.alert('Success', 'Bank account linked successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to link bank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Add Bank</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-3 py-1.5 bg-slate-100 rounded-full">
          <Text className="text-slate-700 font-bold text-xs">Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row gap-3 mb-6">
          <CheckCircle size={20} color="#2563EB" />
          <Text className="flex-1 text-sm text-blue-900 font-medium">
            Please ensure the account holder name matches your government ID exactly to avoid payout delays.
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Bank Name *</Text>
            <TextInput 
              value={formData.bankName}
              onChangeText={t => setFormData({...formData, bankName: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="e.g. HDFC Bank"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Account Holder Name *</Text>
            <TextInput 
              value={formData.accountHolder}
              onChangeText={t => setFormData({...formData, accountHolder: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="As per bank records"
              autoCapitalize="characters"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Account Number *</Text>
            <TextInput 
              value={formData.accountNumber}
              onChangeText={t => setFormData({...formData, accountNumber: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter account number"
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Confirm Account Number *</Text>
            <TextInput 
              value={formData.confirmNumber}
              onChangeText={t => setFormData({...formData, confirmNumber: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Re-enter account number"
              keyboardType="number-pad"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">IFSC Code *</Text>
            <TextInput 
              value={formData.ifsc}
              onChangeText={t => setFormData({...formData, ifsc: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="e.g. HDFC0001234"
              autoCapitalize="characters"
            />
          </View>
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Branch (Optional)</Text>
            <TextInput 
              value={formData.branch}
              onChangeText={t => setFormData({...formData, branch: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="e.g. Navrangpura"
            />
          </View>
          
          <PrimaryButton 
            title={loading ? "Verifying..." : "Verify & Link"} 
            onPress={handleSave} 
            color="bg-slate-900" 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
