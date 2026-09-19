import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, MonitorSmartphone, PlayCircle, MapPin, CarFront, User, ArrowLeft, Bus, Battery, Signal } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function DeviceDetailsScreen({ route, navigation }) {
  const { isDark } = useTheme();
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
    <View 
      style={{ borderBottomColor: isDark ? '#281B4B' : '#F1F5F9' }}
      className="flex-row items-center py-3.5 border-b"
    >
      <View 
        style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
        className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
      >
        <Icon size={18} color={isDark ? '#C084FC' : '#7C3AED'} />
      </View>
      <View className="flex-1">
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</Text>
        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">{value}</Text>
      </View>
    </View>
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
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">Display Node Telemetry</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Live Operational Status</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : device ? (
        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
          
          <View className="items-center mb-6">
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#C084FC']}
              className="w-20 h-20 rounded-3xl items-center justify-center mb-3 shadow-lg"
              style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
            >
              <MonitorSmartphone size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight mb-1">{device.vehicle}</Text>
            <View 
              style={{ 
                backgroundColor: device.status === 'Online' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                borderColor: device.status === 'Online' ? '#10B981' : '#94A3B8' 
              }}
              className="px-3 py-1 rounded-full border flex-row items-center"
            >
              <View className={`w-1.5 h-1.5 rounded-full ${device.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'} mr-1.5`} />
              <Text className={`text-[10px] font-black uppercase tracking-wider ${device.status === 'Online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                {device.status}
              </Text>
            </View>
          </View>

          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="border rounded-3xl p-5 shadow-sm"
          >
            <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black uppercase tracking-wider mb-2">Hardware Specifications</Text>
            
            <DetailRow icon={MonitorSmartphone} label="Display Identifier" value={`ID-${device.id}`} />
            <DetailRow icon={Bus} label="Transit Fleet Bus" value={device.vehicle} />
            <DetailRow icon={User} label="Designated Route / Driver" value={device.driver || 'Municipal Fleet #4'} />
            <DetailRow icon={PlayCircle} label="Today's Verified Playbacks" value={`${device.todayPlays || 0} Ad Plays`} />
            <View className="flex-row items-center py-3.5">
              <View 
                style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
                className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
              >
                <MapPin size={18} color={isDark ? '#C084FC' : '#7C3AED'} />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Current GPS Corridor</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">Paldi Cross Roads, Ahmedabad</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-sm font-bold">Display node not found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
