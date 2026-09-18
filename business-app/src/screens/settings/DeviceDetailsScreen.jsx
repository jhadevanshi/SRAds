import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, MonitorSmartphone, PlayCircle, MapPin, Map, CarFront, User } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function DeviceDetailsScreen({ route, navigation }) {
  const { deviceId } = route.params;
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDeviceDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getDeviceDetails(deviceId);
      if (res.success) {
        setDevice(res.device);
      }
    } catch (err) {
      console.error('Fetch device details error', err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDeviceDetails();
  }, [fetchDeviceDetails]);

  const DetailRow = ({ icon: Icon, label, value }) => (
    <View className="flex-row items-center py-4 border-b border-slate-100 dark:border-[#30363D]">
      <View className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0D1117] items-center justify-center mr-4">
        <Icon size={18} className="text-slate-500 dark:text-[#8B949E]" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider mb-0.5">{label}</Text>
        <Text className="text-slate-900 dark:text-white font-black text-base">{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
            <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Device Details</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : device ? (
        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
          
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-white dark:bg-[#1E293B] rounded-3xl items-center justify-center border-4 border-slate-100 dark:border-[#30363D] shadow-sm mb-4">
              <MonitorSmartphone size={40} color="#F59E0B" />
            </View>
            <Text className="text-slate-900 dark:text-white text-2xl font-black tracking-tight mb-1">{device.vehicle}</Text>
            <View className={`px-3 py-1.5 rounded-full border ${device.status === 'Online' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <Text className={`text-[10px] font-black uppercase tracking-widest ${device.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {device.status}
              </Text>
            </View>
          </View>

          <View className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#30363D] rounded-3xl p-5 shadow-sm">
            <Text className="text-slate-900 dark:text-white font-black text-lg mb-2">Information</Text>
            
            <DetailRow icon={MonitorSmartphone} label="Display ID" value={device.id} />
            <DetailRow icon={CarFront} label="Vehicle Number" value={device.vehicle} />
            <DetailRow icon={User} label="Driver Name" value={device.driver} />
            <DetailRow icon={PlayCircle} label="Today's Plays" value={`${device.todayPlays} Ads Played`} />
            <View className="flex-row items-center py-4">
              <View className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0D1117] items-center justify-center mr-4">
                <MapPin size={18} className="text-slate-500 dark:text-[#8B949E]" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider mb-0.5">Current Location</Text>
                <Text className="text-slate-900 dark:text-white font-black text-base">Paldi Cross Roads, Ahmedabad</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-base">Device not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
