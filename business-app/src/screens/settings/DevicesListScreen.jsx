import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, MonitorSmartphone, Battery, Signal, Clock, ArrowLeft, Bus } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function DevicesListScreen({ navigation }) {
  const { isDark } = useTheme();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getLinkedDevices();
      if (res.success) {
        setDevices(res.devices || []);
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
      style={{ 
        backgroundColor: isDark ? '#140F24' : '#FFFFFF',
        borderColor: isDark ? '#281B4B' : '#EDE9FE',
        shadowColor: isDark ? '#7C3AED' : '#9333EA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.15 : 0.05,
        shadowRadius: 6,
        elevation: 2
      }}
      className="border rounded-2xl p-4 mb-3.5 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1">
          <LinearGradient
            colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
            className="w-11 h-11 rounded-xl items-center justify-center mr-3.5 shadow-sm"
          >
            <Bus size={20} color={isDark ? '#FFFFFF' : '#7C3AED'} />
          </LinearGradient>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base tracking-tight mb-0.5">{item.vehicle}</Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider">Node #{item.id}</Text>
          </View>
        </View>
        
        <View 
          style={{ 
            backgroundColor: item.status === 'Online' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
            borderColor: item.status === 'Online' ? '#10B981' : '#94A3B8' 
          }}
          className="px-2.5 py-1 rounded-full border flex-row items-center"
        >
          <View className={`w-1.5 h-1.5 rounded-full ${item.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'} mr-1.5`} />
          <Text className={`text-[10px] font-black uppercase tracking-wider ${item.status === 'Online' ? 'text-emerald-500' : 'text-slate-400'}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View 
        style={{ borderTopColor: isDark ? '#281B4B' : '#F1F5F9' }}
        className="flex-row justify-between pt-3 border-t"
      >
        <View className="flex-row items-center">
          <Battery size={13} color={isDark ? '#94A3B8' : '#64748B'} style={{ marginRight: 4 }} />
          <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">{item.battery || '98%'}</Text>
        </View>
        <View className="flex-row items-center">
          <Signal size={13} color={item.status === 'Online' ? '#10B981' : '#94A3B8'} style={{ marginRight: 4 }} />
          <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">4G LTE</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={13} color={isDark ? '#94A3B8' : '#64748B'} style={{ marginRight: 4 }} />
          <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">{item.lastSeen || 'Just now'}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">Linked Displays</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Hardware Telemetry & Screen Grid</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 18, paddingBottom: 100 }}
          ListEmptyComponent={
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="items-center mt-6 border rounded-3xl p-8 shadow-sm"
            >
              <MonitorSmartphone size={32} color={isDark ? '#64748B' : '#94A3B8'} className="mb-3" />
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-base font-extrabold mb-1">No Hardware Linked</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs text-center">Linked hardware displays appear automatically with transit campaign allocations.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
