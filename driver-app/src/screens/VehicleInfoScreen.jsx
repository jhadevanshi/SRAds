import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CarFront, CheckCircle2 } from 'lucide-react-native';
import FloatingBottomNav from '../components/FloatingBottomNav';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';

export default function VehicleInfoScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/driver/profile')
      .then(res => setProfile(res.data.profile))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Vehicle Info</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Main Spec Card */}
        {loading ? (
          <View className="bg-purple-900 rounded-[24px] p-6 shadow-lg h-48 justify-center items-center mb-6">
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <View className="bg-purple-900 rounded-[24px] p-6 shadow-lg shadow-purple-900/30 mb-6 overflow-hidden relative">
            <View className="absolute right-4 top-4 opacity-30">
               <CarFront size={100} color="#FFFFFF" />
            </View>
            
            <Text className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">Registered Vehicle</Text>
            <Text className="text-white text-3xl font-black tracking-tight mb-1">{profile?.vehicle_number || 'No Vehicle'}</Text>
            <Text className="text-purple-300 font-medium mb-6 uppercase">{profile?.vehicle_type || 'Unknown Type'}</Text>
            
            <View className="flex-row gap-4 bg-purple-950/50 p-4 rounded-2xl">
              <View className="flex-1">
                <Text className="text-purple-300 text-xs font-bold mb-1">Status</Text>
                <View className="flex-row items-center gap-1.5">
                  <CheckCircle2 size={16} color="#34D399" />
                  <Text className="text-white font-bold text-lg">{profile?.status || 'Unknown'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Documents & Compliance</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-6">
          <Text className="py-4 text-center text-slate-400 font-bold">No documents available</Text>
        </View>

        <PrimaryButton 
          title="Update Vehicle Details" 
          color="bg-white border border-slate-200 shadow-sm" 
          textColor="text-slate-900" 
          onPress={() => navigation.navigate('AccountSettings')}
        />
      </ScrollView>
      <FloatingBottomNav />
    </SafeAreaView>
  );
}
