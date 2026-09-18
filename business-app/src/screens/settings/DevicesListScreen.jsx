import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, MonitorSmartphone, Battery, Signal, Clock } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function DevicesListScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getLinkedDevices();
      if (res.success) {
        setDevices(res.devices);
      }
    } catch (err) {
      console.error('Fetch devices error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchDevices);
    return unsubscribe;
  }, [navigation, fetchDevices]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DeviceDetails', { deviceId: item.id })}
      className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#30363D] rounded-2xl p-5 mb-4 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-slate-50 dark:bg-[#0D1117] rounded-xl items-center justify-center mr-4 border border-slate-100 dark:border-[#30363D]">
            <MonitorSmartphone size={24} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight mb-0.5">{item.vehicle}</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider">ID: {item.id}</Text>
          </View>
        </View>
        <View className={`px-2.5 py-1 rounded-full border ${item.status === 'Online' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <Text className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'Online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between pt-4 border-t border-slate-100 dark:border-[#30363D]">
        <View className="flex-row items-center">
          <Battery size={14} className="text-slate-400 dark:text-[#8B949E] mr-1" />
          <Text className="text-slate-600 dark:text-[#8B949E] text-xs font-bold">{item.battery}</Text>
        </View>
        <View className="flex-row items-center">
          <Signal size={14} className={item.status === 'Online' ? "text-emerald-500" : "text-slate-400 dark:text-[#8B949E]"} />
          <Text className="text-slate-600 dark:text-[#8B949E] text-xs font-bold ml-1">GPS</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} className="text-slate-400 dark:text-[#8B949E] mr-1" />
          <Text className="text-slate-600 dark:text-[#8B949E] text-xs font-bold">{item.lastSeen}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
            <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Linked Displays</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-slate-500 dark:text-[#8B949E] text-base font-bold">No displays linked yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
