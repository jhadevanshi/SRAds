import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Shield, Fingerprint, LogOut, Trash2 } from 'lucide-react-native';
import ListTile from '../components/ListTile';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountSettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_number: '',
    id: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/driver/profile');
      setFormData({
        name: res.data.profile.name || '',
        phone: res.data.profile.phone || '',
        email: res.data.profile.email || '',
        vehicle_number: res.data.profile.vehicle_number || '',
        id: res.data.profile.id?.toString() || ''
      });
    } catch (err) {
      if (err.response?.status !== 401) {
        Alert.alert('Error', 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      return Alert.alert('Validation Error', 'Name and Phone are required.');
    }
    setSaving(true);
    try {
      await api.put('/driver/profile', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email
      });
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.prompt(
      "Delete Account",
      "This action cannot be undone. Please enter your password to confirm deletion.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async (password) => {
            try {
              await api.delete('/driver/account', { data: { password } });
              Alert.alert('Deleted', 'Your account has been successfully deleted.');
              logout();
            } catch (err) {
              if (err.response?.status !== 401) {
                console.error(err);
              }
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete account');
            }
          }
        }
      ],
      "secure-text"
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Account</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-3 py-1.5 bg-slate-100 rounded-full">
          <Text className="text-slate-700 font-bold text-xs">Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm mb-4">
            <User color="#2563EB" size={40} />
          </View>
          <Text className="text-blue-600 font-bold text-sm">Change Photo</Text>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Personal Information</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Full Name</Text>
            <TextInput 
              value={formData.name}
              onChangeText={t => setFormData({...formData, name: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter your name"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Phone Number</Text>
            <TextInput 
              value={formData.phone}
              onChangeText={t => setFormData({...formData, phone: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter your phone"
              keyboardType="phone-pad"
            />
          </View>
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Email Address</Text>
            <TextInput 
              value={formData.email}
              onChangeText={t => setFormData({...formData, email: t})}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <PrimaryButton 
            title={saving ? "Saving..." : "Save Changes"} 
            onPress={handleSave} 
            color="bg-blue-600" 
          />
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">System Details</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Vehicle Number</Text>
            <TextInput 
              value={formData.vehicle_number}
              editable={false}
              className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium"
            />
          </View>
          <View>
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Driver ID</Text>
            <TextInput 
              value={`#DRV-${formData.id}`}
              editable={false}
              className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium"
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Security</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={Shield} title="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
          <ListTile icon={Fingerprint} title="Enable Fingerprint" subtitle="Coming soon" onPress={() => {}} />
          <ListTile icon={LogOut} title="Logout all devices" onPress={() => Alert.alert('Success', 'Logged out of all other devices.')} />
          <ListTile icon={Trash2} title="Delete Account" danger={true} onPress={handleDeleteAccount} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
