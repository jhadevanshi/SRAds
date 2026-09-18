import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Camera } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../services/business';

const InputField = React.memo(({ label, value, onChangeText, keyboardType = 'default', editable = true }) => (
  <View className="mb-4">
    <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider mb-2 ml-1">{label}</Text>
    <TextInput
      className={`bg-white dark:bg-[#1E293B] ${editable ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#64748B]'} border border-slate-200 dark:border-[#30363D] rounded-2xl px-5 py-4 font-bold shadow-sm`}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor="#94A3B8"
      editable={editable}
    />
  </View>
));

export default function AccountDetailsScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    businessName: user?.company_name || '',
    ownerName: user?.owner_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gstin: user?.gst || '',
    address: user?.address || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await businessService.updateProfile(form);
      if (res.success) {
        setUser({
          ...user,
          ...res.business
        });
        Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
            <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Account Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-slate-200 dark:bg-[#1E293B] rounded-full items-center justify-center border-4 border-white dark:border-[#30363D] shadow-sm mb-3 relative">
            <Camera size={32} className="text-slate-400 dark:text-[#8B949E]" />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#F59E0B] w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-[#0D1117]">
              <Text className="text-white font-bold text-lg leading-tight">+</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Update Business Logo</Text>
        </View>

        <InputField label="Business Name" value={form.businessName} onChangeText={(t) => setForm({...form, businessName: t})} />
        <InputField label="Owner Name" value={form.ownerName} onChangeText={(t) => setForm({...form, ownerName: t})} />
        <InputField label="Email Address" value={form.email} onChangeText={(t) => setForm({...form, email: t})} keyboardType="email-address" />
        <InputField label="Phone Number" value={form.phone} onChangeText={(t) => setForm({...form, phone: t})} keyboardType="phone-pad" />
        <InputField label="GSTIN" value={form.gstin} onChangeText={(t) => setForm({...form, gstin: t})} editable={false} />
        <InputField label="Registered Address" value={form.address} onChangeText={(t) => setForm({...form, address: t})} />

      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-[#F8FAFC]/90 dark:bg-[#0D1117]/90 border-t border-slate-100 dark:border-[#30363D]">
        <TouchableOpacity 
          className="bg-[#F59E0B] rounded-2xl py-4 items-center shadow-md shadow-amber-500/20"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-black text-lg tracking-tight">Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
