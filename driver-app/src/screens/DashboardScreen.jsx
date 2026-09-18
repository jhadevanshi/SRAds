import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { 
  Settings, Bell, Wallet, History, FileText, Car, HeadphonesIcon,
  CarFront, MapPin, Wifi, BatteryMedium, PlaySquare, User
} from 'lucide-react-native';
import AnimatedBarChart from '../components/AnimatedBarChart';
import ActionCard from '../components/ActionCard';
import TimelineCard from '../components/TimelineCard';
import FloatingBottomNav from '../components/FloatingBottomNav';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen(props) {
  const navigation = props.navigation || useNavigation();
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const [locationName, setLocationName] = useState('Waiting...');
  const [freshnessText, setFreshnessText] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const toggleOnline = () => setIsOnline(!isOnline);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const [profRes, dashRes, histRes] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/dashboard'),
        api.get('/driver/history')
      ]);
      
      setProfile(profRes.data.profile);
      setDashboard(dashRes.data.dashboard);
      setHistory(histRes.data.history);
      
      if (dashRes.data.dashboard?.device?.status === 'Offline') {
        setIsOnline(false);
      } else {
        setIsOnline(true);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(false), 8000);
    
    let locationSub = null;
    const fetchTelemetry = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Start Earnings Engine GPS Tracking (Throttled to 10s)
          locationSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
            async (newLoc) => {
              try {
                const payload = {
                  latitude: newLoc.coords.latitude,
                  longitude: newLoc.coords.longitude,
                  accuracy: newLoc.coords.accuracy,
                  speed: newLoc.coords.speed !== -1 ? (newLoc.coords.speed * 3.6) : undefined // convert m/s to km/h if available
                };
                const res = await api.post('/driver/location', payload);
                if (res.data?.success && res.data?.wallet) {
                  // Soft update wallet balance on dashboard without full reload
                  setDashboard(prev => ({
                    ...prev,
                    wallet_balance: res.data.wallet.balance,
                    distance_remaining: res.data.wallet.distanceRemaining,
                    today: {
                      ...prev?.today,
                      income: res.data.wallet.transactions.length > 0 ? 
                              (parseFloat(prev?.today?.income || 0) + (res.data.wallet.transactions.length * 10)) : 
                              parseFloat(prev?.today?.income || 0)
                    }
                  }));
                }
              } catch (e) {
                // Silently ignore network failures to prevent UI spam
              }
            }
          );

        }
      } catch (e) {
        console.log("Telemetry error", e);
      }
    };
    fetchTelemetry();

    return () => {
      clearInterval(t);
      if (locationSub) locationSub.remove();
    };
  }, [fetchData]);

  // Handle Reverse Geocoding of device coordinates and calculate freshness
  useEffect(() => {
    if (dashboard?.device?.latitude && dashboard?.device?.longitude) {
      Location.reverseGeocodeAsync({ 
        latitude: Number(dashboard.device.latitude), 
        longitude: Number(dashboard.device.longitude) 
      }).then(geocode => {
        if (geocode && geocode.length > 0) {
          setLocationName(geocode[0].city || geocode[0].district || geocode[0].region || 'GPS Active');
        } else {
          setLocationName(`${Number(dashboard.device.latitude).toFixed(2)}, ${Number(dashboard.device.longitude).toFixed(2)}`);
        }
      }).catch(() => {
        setLocationName(`${Number(dashboard.device.latitude).toFixed(2)}, ${Number(dashboard.device.longitude).toFixed(2)}`);
      });
    } else {
      setLocationName('Waiting...');
    }
  }, [dashboard?.device?.latitude, dashboard?.device?.longitude]);

  useEffect(() => {
    const updateFreshness = () => {
      if (!dashboard?.device?.heartbeat_at) {
        setFreshnessText('');
        return;
      }
      const seconds = Math.floor((new Date() - new Date(dashboard.device.heartbeat_at)) / 1000);
      if (seconds < 60) setFreshnessText(`Updated ${seconds} sec ago`);
      else if (seconds < 3600) setFreshnessText(`Updated ${Math.floor(seconds / 60)} min ago`);
      else setFreshnessText(`Updated ${Math.floor(seconds / 3600)} hr ago`);
    };
    
    updateFreshness();
    const ft = setInterval(updateFreshness, 1000);
    return () => clearInterval(ft);
  }, [dashboard?.device?.heartbeat_at]);

  if (loading && !profile) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const today = dashboard?.today || {};
  const device = dashboard?.device || {};
  const pb = dashboard?.playback || {};
  const maxIncome = Math.max(...history.map(h => Number(h.income) || 0), 1);

  // Mock Timeline Data
  const recentActivity = [];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      
      {/* 1. Header Section */}
      <View className="px-5 py-4 flex-row items-center justify-between bg-[#F8FAFC]">
        <View>
          <Text className="text-sm font-medium text-slate-500 mb-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <Text className="text-2xl font-black text-slate-900 tracking-tight">
            Hello, {profile?.name?.split(' ')[0] || 'Captain'} 👋
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-slate-100 relative">
            <Bell size={20} color="#0F172A" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center border-2 border-white shadow-sm overflow-hidden"
          >
            {profile?.profile_photo ? (
              <Image source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${profile.profile_photo}` }} className="w-full h-full" />
            ) : (
              <User size={20} color="#64748B" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center shadow-md shadow-blue-500/30 ml-2"
          >
            <Settings size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#0F172A" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pb-5">
          
          {/* 2. Driver Status Card */}
          <View className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 mb-6">
            
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-slate-100 rounded-2xl items-center justify-center">
                  <CarFront size={24} color="#0F172A" />
                </View>
                <View>
                  <Text className="text-slate-900 text-lg font-black">{device.vehicle_number || profile?.vehicle_number}</Text>
                  <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest">{device.vehicle_type || profile?.vehicle_type}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={toggleOnline}
                className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 ${isOnline ? 'bg-emerald-100' : 'bg-slate-100'}`}
              >
                <View className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <Text className={`text-sm font-black ${isOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between bg-[#F8FAFC] rounded-2xl p-4 mb-2 border border-slate-50">
              <View className="items-center">
                <MapPin size={20} color="#64748B" className="mb-1" />
                <Text className="text-slate-700 text-xs font-bold">{locationName}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Location</Text>
              </View>
              <View className="w-[1px] h-full bg-slate-200" />
              <View className="items-center">
                <Wifi size={20} color={device?.internet_status === 'Connected' ? "#10B981" : "#F59E0B"} className="mb-1" />
                <Text className="text-slate-700 text-xs font-bold">{device?.internet_status || 'Checking...'}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Internet</Text>
              </View>
              <View className="w-[1px] h-full bg-slate-200" />
              <View className="items-center">
                <BatteryMedium size={20} color={device?.battery_level > 20 ? "#10B981" : "#EF4444"} className="mb-1" />
                <Text className="text-slate-700 text-xs font-bold">{device?.battery_level !== undefined ? `${device.battery_level}%` : 'Reading...'}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Battery</Text>
              </View>
            </View>
            {freshnessText ? <Text className="text-center text-slate-400 text-[10px] font-bold mb-4">{freshnessText}</Text> : <View className="mb-4" />}

          </View>

          {/* 3. Performance Card (Earnings + Chart) */}
          <View className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden">
            <View className="p-5 pb-0 flex-row justify-between items-end">
              <View>
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Today's Earnings</Text>
                <Text className="text-slate-900 text-4xl font-black tracking-tight">₹{parseFloat(today.income || 0).toFixed(2)}</Text>
              </View>
              <View className="items-end mb-1">
                <Text className="text-emerald-500 text-[10px] font-black uppercase mb-0.5">Wallet Balance</Text>
                <Text className="text-slate-800 text-lg font-black">₹{parseFloat(dashboard?.wallet_balance || 0).toFixed(2)}</Text>
                {dashboard?.distance_remaining && (
                   <Text className="text-slate-400 text-[10px] font-bold mt-0.5">{parseFloat(dashboard.distance_remaining).toFixed(3)}km to next ₹10</Text>
                )}
              </View>
            </View>
            {/* We place the AnimatedBarChart inside but without its own background padding to merge seamlessly */}
            <View className="-m-5 mt-0 scale-95 origin-top">
              <AnimatedBarChart 
                title=""
                data={history}
                dataKey="income"
                maxValue={maxIncome}
                formatValue={v => `₹${v.toFixed(0)}`}
                barColor="bg-emerald-200"
                activeBarColor="bg-emerald-500"
                onDetailsPress={() => navigation.navigate('Earnings')}
              />
            </View>
          </View>

          {/* 4. Quick Actions Grid */}
          <Text className="text-lg font-black text-slate-900 mb-4 tracking-tight">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <ActionCard icon={Wallet} title="Earnings" color="#10B981" bgColor="bg-emerald-50" onPress={() => navigation.navigate('Earnings')} />
            <ActionCard icon={History} title="Trip History" color="#3B82F6" bgColor="bg-blue-50" onPress={() => navigation.navigate('TripsHistory')} />
            <ActionCard icon={FileText} title="Ad History" color="#F59E0B" bgColor="bg-amber-50" onPress={() => navigation.navigate('AdvertisementHistory')} />
            <ActionCard icon={Car} title="Vehicle Info" color="#8B5CF6" bgColor="bg-purple-50" onPress={() => navigation.navigate('VehicleInfo')} />
            <ActionCard icon={HeadphonesIcon} title="Support" color="#EC4899" bgColor="bg-pink-50" onPress={() => navigation.navigate('Support')} />
            <ActionCard icon={Settings} title="Settings" color="#64748B" bgColor="bg-slate-50" onPress={() => navigation.navigate('Settings')} />
          </View>

          {/* 5. Recent Activity */}
          <View className="mt-6 mb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</Text>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-blue-600">See All</Text>
              </TouchableOpacity>
            </View>
            <TimelineCard events={recentActivity} />
          </View>

        </View>
      </ScrollView>

      <FloatingBottomNav />
    </SafeAreaView>
  );
}
