import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, User, CreditCard, Shield, HelpCircle, 
  Globe, Info, LogOut, Car, CheckCircle2 
} from 'lucide-react-native';
import ListTile from '../components/ListTile';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen(props) {
  const navigation = props.navigation || useNavigation();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/driver/profile');
        setProfile(res.data.profile);
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error(err);
        }
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    fetchProfile();
    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: logout
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* User Profile Card */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AccountSettings')}
          className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 mb-8 flex-row items-center"
        >
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center border-2 border-white shadow-sm mr-4">
            <User color="#2563EB" size={32} />
          </View>
          {profile ? (
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-900 mb-0.5">{profile.name}</Text>
              <Text className="text-slate-500 font-medium text-sm mb-2">{profile.phone}</Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Car size={12} color="#64748B" />
                  <Text className="text-[10px] font-bold text-slate-600 uppercase">{profile.vehicle_number}</Text>
                </View>
                <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text className="text-[10px] font-bold text-emerald-700 uppercase">{profile.status}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center">
              <Text className="text-slate-400 font-bold">Loading profile...</Text>
            </View>
          )}
          <ArrowLeft size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Preferences</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={User} title="Account Settings" subtitle="Personal details & verification" onPress={() => navigation.navigate('AccountSettings')} />
          <ListTile icon={CreditCard} title="Payment Methods" subtitle="Bank accounts & wallets" onPress={() => navigation.navigate('PaymentMethods')} />
          <ListTile icon={Globe} title="Language" subtitle="English (US)" onPress={() => navigation.navigate('Language')} />
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Support & Legal</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={HelpCircle} title="Help & Support" onPress={() => navigation.navigate('Support')} />
          <ListTile icon={Shield} title="Privacy Policy" onPress={() => navigation.navigate('About')} />
          <ListTile icon={Info} title="About App" subtitle="Version 1.0.0" onPress={() => navigation.navigate('About')} />
        </View>

        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={LogOut} title="Logout" danger={true} onPress={handleLogout} />
        </View>
        
        <Text className="text-center text-slate-400 font-bold text-xs mb-8">SRAds Driver Platform</Text>

      </ScrollView>
    </SafeAreaView>
  );
}
