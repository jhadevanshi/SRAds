import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ArrowLeft, 
  MapPin, 
  PlayCircle, 
  AlertCircle, 
  Clock, 
  Video, 
  Image as ImageIcon, 
  Activity, 
  BarChart2, 
  Route, 
  X, 
  Car, 
  Bus, 
  CarFront, 
  MonitorPlay,
  Navigation,
  Radio,
  Zap,
  TrendingUp
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import LiveFleetMap from '../../components/fleet/LiveFleetMap';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/designTokens';

const VEHICLE_ICONS = {
  Car: Car,
  car: Car,
  Auto: CarFront,
  auto: CarFront,
  BRTS: Bus,
  brts: Bus,
  Bus: Bus,
  bus: Bus,
};

const getVehicleIcon = (type) => {
  if (!type) return Bus;
  return VEHICLE_ICONS[type] || VEHICLE_ICONS[type.toLowerCase()] || Bus;
};

const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';
};

export default function LiveFleetScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchFleet = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const token = await AsyncStorage.getItem('businessToken');
      const url = `${getBaseUrl()}/api/business/fleet/live`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const liveDevices = response.data.fleet || [];
        setFleet(liveDevices);
        setLastUpdated(new Date());
        setError(null);
        
        if (selectedVehicle) {
          const updated = liveDevices.find(v => v.device_id === selectedVehicle.device_id);
          setSelectedVehicle(updated || null);
        }
      } else {
        setError('Server returned an unexpected error.');
      }
    } catch (err) {
      const errMessage = err.response?.data?.message || err.message || 'Unknown network error';
      if (err.response?.status === 401) {
        setError('Authentication session expired.');
      } else {
        setError(`Unable to connect to transit fleet (${errMessage})`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedVehicle, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFleet(false);
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchFleet(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !error && !refreshing) fetchFleet(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchFleet, loading, error, refreshing]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      fetchFleet(false);
    });
    const subStatus = DeviceEventEmitter.addListener('DEVICE_STATUS_UPDATED', () => {
      fetchFleet(false);
    });
    return () => {
      subPlayback.remove();
      subStatus.remove();
    };
  }, [fetchFleet]);

  const formatTime = (isoString) => {
    if (!isoString) return 'Active';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getLiveCostAndDuration = (vehicle) => {
    if (!vehicle.started_at) return { elapsed: 0, cost: 0, text: 'Idle', completed: false };
    const start = new Date(vehicle.started_at);
    const diffMs = now - start;
    const elapsedSec = Math.max(0, Math.floor(diffMs / 1000));
    
    const limit = parseInt(vehicle.play_duration || vehicle.media_duration || 15, 10);
    const elapsed = Math.min(limit, elapsedSec);
    const cost = elapsed * 0.02;
    const completed = elapsedSec >= limit;
    
    return {
      elapsed,
      cost,
      completed,
      text: completed ? `Completed (Spend: ₹${cost.toFixed(2)})` : `Live Playing: ${elapsed}s / ${limit}s`
    };
  };

  const getLocationStatus = (vehicle) => {
    if (!vehicle) return { text: 'GPS Signal Calibrating', fresh: false };
    
    if (!vehicle.location_updated_at) {
      return { 
        text: `Last reported: ${vehicle.area || 'Metro Corridor'}`, 
        fresh: false 
      };
    }
    
    const updatedTime = new Date(vehicle.location_updated_at);
    const diffMs = now - updatedTime;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    
    if (diffSec <= 60) {
      return { 
        text: `GPS Live · ${diffSec}s ago`, 
        fresh: true 
      };
    } else {
      return { 
        text: `Zone: ${vehicle.area || 'Transit Route'}`, 
        fresh: false 
      };
    }
  };

  const getElapsedTimeSeconds = () => {
    return Math.floor((new Date() - lastUpdated) / 1000);
  };

  const totalPlays = fleet.reduce((acc, v) => acc + (parseInt(v.plays_today) || 0), 0);
  const vehiclesMoving = fleet.filter(v => parseFloat(v.distance_today) > 0).length;

  return (
    <SafeAreaView 
      style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} 
      className="flex-1" 
      edges={['top']}
    >
      {/* Top Header */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="px-5 py-4 border-b z-10 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
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
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">
              Fleet Radar
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">
              Live Transit Displays & Playbacks
            </Text>
          </View>
        </View>

        {/* Live Radar Pulse */}
        <View 
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          className="px-3 py-1 rounded-full border flex-row items-center"
        >
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
          <Text className="text-emerald-500 font-extrabold text-[10px] tracking-wider uppercase">Live Sync</Text>
        </View>
      </View>

      {error && (
        <View 
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderBottomColor: 'rgba(239, 68, 68, 0.25)' }}
          className="px-5 py-3 flex-row items-center justify-between border-b"
        >
          <View className="flex-row items-center flex-1 mr-4">
            <AlertCircle size={15} color="#EF4444" style={{ marginRight: 6 }} />
            <Text className="text-rose-500 font-bold text-xs">{error}</Text>
          </View>
          <TouchableOpacity onPress={() => fetchFleet(true)}>
            <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-xs uppercase tracking-wider">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
      >
        {/* Top 3-Stat Metric Row */}
        <View className="px-5 pt-5 pb-2">
          <View className="flex-row gap-2.5 mb-3">
            {/* Active Displays */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE',
              }}
              className="flex-1 p-3.5 rounded-2xl border shadow-sm"
            >
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" />
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider">Screens</Text>
              </View>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black">{fleet.length}</Text>
            </View>

            {/* Total Plays Today */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE',
              }}
              className="flex-1 p-3.5 rounded-2xl border shadow-sm"
            >
              <View className="flex-row items-center mb-1">
                <PlayCircle size={12} color="#A855F7" style={{ marginRight: 4 }} />
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider">Plays Today</Text>
              </View>
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-2xl font-black">{totalPlays}</Text>
            </View>

            {/* In Transit */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE',
              }}
              className="flex-1 p-3.5 rounded-2xl border shadow-sm"
            >
              <View className="flex-row items-center mb-1">
                <Bus size={12} color="#38BDF8" style={{ marginRight: 4 }} />
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider">In Transit</Text>
              </View>
              <Text style={{ color: isDark ? '#38BDF8' : '#0284C7' }} className="text-2xl font-black">{vehiclesMoving}</Text>
            </View>
          </View>
        </View>

        {/* Live GPS Map Container */}
        <View className="px-5 mb-5">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black uppercase tracking-wider">
              Transit Radar Grid
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] font-semibold">
              Synced {getElapsedTimeSeconds()}s ago
            </Text>
          </View>
          
          <View 
            style={{ 
              height: 260, 
              borderColor: isDark ? '#7C3AED' : '#C084FC',
              shadowColor: isDark ? '#7C3AED' : '#9333EA',
              shadowOpacity: isDark ? 0.25 : 0.1,
              shadowRadius: 10,
              elevation: 4
            }} 
            className="rounded-3xl overflow-hidden border-2"
          >
            <LiveFleetMap 
              fleet={fleet}
              loading={loading}
              error={error}
              onSelectVehicle={(v) => setSelectedVehicle(v)}
              selectedVehicleId={selectedVehicle?.device_id}
            />
          </View>
        </View>

        {/* Display Telemetry Feed */}
        <View className="px-5 pb-10">
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-base font-extrabold tracking-tight mb-3">
            Active Display Nodes ({fleet.length})
          </Text>

          {fleet.length === 0 ? (
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="border rounded-3xl p-8 items-center"
            >
              <LinearGradient
                colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              >
                <Radio size={28} color={isDark ? '#FFFFFF' : '#7C3AED'} />
              </LinearGradient>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base mb-1">
                No Broadcasts In Progress
              </Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-xs px-2 leading-relaxed">
                Active vehicles and digital transit screens will populate dynamically as soon as an approved campaign is in flight.
              </Text>
            </View>
          ) : (
            fleet.map((vehicle, idx) => {
              const isVideo = vehicle.media_type === 'video';
              const vType = vehicle.vehicle_type || 'BRTS Bus';
              const IconComponent = getVehicleIcon(vType);
              const liveData = getLiveCostAndDuration(vehicle);
              const locStatus = getLocationStatus(vehicle);

              return (
                <TouchableOpacity 
                  key={vehicle.device_id || idx} 
                  onPress={() => setSelectedVehicle(vehicle)}
                  style={{ 
                    backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                    borderColor: isDark ? '#281B4B' : '#EDE9FE',
                    shadowColor: isDark ? '#7C3AED' : '#9333EA',
                    shadowOpacity: isDark ? 0.15 : 0.05,
                    shadowRadius: 6,
                    elevation: 2
                  }}
                  className="border rounded-3xl p-5 mb-4"
                  activeOpacity={0.7}
                >
                  {/* Top Vehicle Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center flex-1">
                      <LinearGradient
                        colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3 shadow-sm"
                      >
                        <IconComponent size={18} color={isDark ? '#FFFFFF' : '#7C3AED'} />
                      </LinearGradient>
                      <View className="flex-1">
                        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm tracking-tight">
                          {vehicle.vehicle_number || vehicle.adsd_id}
                        </Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] font-semibold uppercase">
                          {vType} · Screen #{idx + 1}
                        </Text>
                      </View>
                    </View>

                    <View 
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                      className="px-2.5 py-1 rounded-full border flex-row items-center"
                    >
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      <Text className="text-emerald-500 font-extrabold text-[10px] uppercase tracking-wider">Broadcasting</Text>
                    </View>
                  </View>

                  {/* Ad Creative Info */}
                  <View 
                    style={{ backgroundColor: isDark ? '#0D091A' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
                    className="p-3 rounded-2xl border flex-row items-center justify-between mb-3"
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="p-1.5 rounded-lg mr-2.5">
                        {isVideo ? <Video size={14} color="#38BDF8" /> : <ImageIcon size={14} color="#A855F7" />}
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xs" numberOfLines={1}>
                          {vehicle.ad_title || 'Active Commercial'}
                        </Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px]">
                          {liveData.text}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-black text-xs">
                      ₹{liveData.cost.toFixed(2)}
                    </Text>
                  </View>

                  {/* GPS & Distance */}
                  <View className="flex-row justify-between items-center pt-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <MapPin size={13} color="#A855F7" style={{ marginRight: 4 }} />
                      <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold" numberOfLines={1}>
                        {vehicle.area || 'Metro Network'}
                      </Text>
                    </View>
                    
                    <Text style={{ color: locStatus.fresh ? '#10B981' : '#F59E0B' }} className="text-[10px] font-bold">
                      {locStatus.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Vehicle Detail Modal */}
      <Modal visible={!!selectedVehicle} animationType="slide" transparent onRequestClose={() => setSelectedVehicle(null)}>
        <View className="flex-1 bg-black/75 justify-end">
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="rounded-t-[32px] p-6 border-t shadow-2xl"
          >
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-md"
                >
                  <Bus size={22} color="#FFFFFF" />
                </LinearGradient>
                <View>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">
                    {selectedVehicle?.vehicle_number || selectedVehicle?.adsd_id}
                  </Text>
                  <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-bold uppercase tracking-wider">
                    {selectedVehicle?.vehicle_type || 'Transit Vehicle'} · Live Node
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setSelectedVehicle(null)} 
                style={{ backgroundColor: isDark ? '#281B4B' : '#F1F5F9' }}
                className="p-2 rounded-full"
              >
                <X size={18} color={isDark ? '#CBD5E1' : '#475569'} />
              </TouchableOpacity>
            </View>

            {/* Spec Matrix */}
            <View 
              style={{ backgroundColor: isDark ? '#0D091A' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
              className="p-4 rounded-2xl border mb-5"
            >
              <View className="flex-row justify-between py-2 border-b" style={{ borderColor: isDark ? '#281B4B' : '#E2E8F0' }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Active Commercial</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-black">{selectedVehicle?.ad_title || 'Promo'}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b" style={{ borderColor: isDark ? '#281B4B' : '#E2E8F0' }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Today's Plays</Text>
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">{selectedVehicle?.plays_today || 0} times</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b" style={{ borderColor: isDark ? '#281B4B' : '#E2E8F0' }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Target Route</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-black">{selectedVehicle?.area || 'Metro Grid'}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Distance Logged</Text>
                <Text style={{ color: isDark ? '#38BDF8' : '#0284C7' }} className="text-xs font-black">{parseFloat(selectedVehicle?.distance_today || 0).toFixed(1)} km</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setSelectedVehicle(null)}
              className="rounded-2xl overflow-hidden shadow-lg mb-2"
              style={{ shadowColor: '#9333EA', shadowRadius: 8 }}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                className="py-3.5 items-center justify-center"
              >
                <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Close Telemetry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
