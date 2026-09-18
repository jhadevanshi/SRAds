import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock } from 'lucide-react-native';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';

export default function ChangePasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return Alert.alert('Error', 'All fields are required.');
    }
    if (formData.newPassword.length < 6) {
      return Alert.alert('Error', 'New password must be at least 6 characters.');
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match.');
    }

    setLoading(true);
    try {
      await api.put('/driver/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      Alert.alert('Success', 'Password updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Change Password</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-4">
            <Lock color="#10B981" size={32} />
          </View>
          <Text className="text-slate-500 text-center font-medium px-4">
            Your password must be at least 6 characters long and should be difficult for others to guess.
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Current Password</Text>
            <TextInput 
              value={formData.currentPassword}
              onChangeText={t => setFormData({...formData, currentPassword: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter current password"
              secureTextEntry
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">New Password</Text>
            <TextInput 
              value={formData.newPassword}
              onChangeText={t => setFormData({...formData, newPassword: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>
          <View className="mb-6">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Confirm New Password</Text>
            <TextInput 
              value={formData.confirmPassword}
              onChangeText={t => setFormData({...formData, confirmPassword: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>
          
          <PrimaryButton 
            title={loading ? "Updating..." : "Update Password"} 
            onPress={handleSave} 
            color="bg-slate-900" 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
