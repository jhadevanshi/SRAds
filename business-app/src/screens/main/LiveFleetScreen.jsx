import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, MapPin, PlayCircle, AlertCircle, Clock, Video, Image as ImageIcon, Map, Activity, BarChart2, Battery, Route, X, Car, Bus, CarFront, MonitorPlay } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import LiveFleetMap from '../../components/fleet/LiveFleetMap';
import { useNavigation } from '@react-navigation/native';

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
  if (!type) return CarFront; // Default safe icon fallback
  return VEHICLE_ICONS[type] || VEHICLE_ICONS[type.toLowerCase()] || CarFront;
};

const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000';
};

export default function LiveFleetScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
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
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Unable to load live fleet (${errMessage})`);
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
    }, 15000); // 15 seconds real-time fallback polling
    return () => clearInterval(interval);
  }, [fetchFleet, loading, error, refreshing]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      console.log('[LiveFleetScreen] Real-time ad playback completed. Refreshing fleet...');
      fetchFleet(false);
    });
    const subStatus = DeviceEventEmitter.addListener('DEVICE_STATUS_UPDATED', () => {
      console.log('[LiveFleetScreen] Real-time device status updated. Refreshing fleet...');
      fetchFleet(false);
    });
    return () => {
      subPlayback.remove();
      subStatus.remove();
    };
  }, [fetchFleet]);

  const formatTime = (isoString) => {
    if (!isoString) return 'Unknown';
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
      text: completed ? `Completed (Final cost: ₹${cost.toFixed(2)})` : `Playing for: ${elapsed}s / ${limit}s`
    };
  };

  const getLocationStatus = (vehicle) => {
    if (!vehicle) return { text: '⚠️ Location unavailable', fresh: false };
    
    // Log [GPS][BUSINESS] as required by Part 12
    console.log(`[GPS][BUSINESS]\nDevice: ${vehicle.adsd_id || vehicle.device_id}\nLatitude: ${vehicle.latitude}\nLongitude: ${vehicle.longitude}\nArea: ${vehicle.area}\nLocationUpdatedAt: ${vehicle.location_updated_at}`);

    if (!vehicle.location_updated_at) {
      return { 
        text: `⚠️ Location unavailable (Last known: ${vehicle.area || 'Unknown'})`, 
        fresh: false 
      };
    }
    
    const updatedTime = new Date(vehicle.location_updated_at);
    const diffMs = now - updatedTime;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    
    if (diffSec <= 60) {
      return { 
        text: `🟢 Location updated ${diffSec} sec ago`, 
        fresh: true 
      };
    } else {
      return { 
        text: `⚠️ Location unavailable (Last known: ${vehicle.area || 'Unknown'})`, 
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
    <SafeAreaView style={{ flex: 1 }} className="bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      
      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-white dark:bg-[#0D1117] z-10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-50 dark:bg-[#161B22] p-2 rounded-full border border-slate-200 dark:border-[#30363D] mr-3">
          <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">TARGET DISPLAYS</Text>
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Configured routes for your active campaigns
          </Text>
        </View>
      </View>

      {error && (
        <View className="bg-red-50 dark:bg-red-900/20 px-5 py-3 flex-row items-center justify-between border-b border-red-100 dark:border-red-900/30">
          <View className="flex-row items-center flex-1 mr-4">
            <AlertCircle size={16} className="text-red-500 mr-2" />
            <Text className="text-red-700 dark:text-red-400 font-bold text-xs">{error}</Text>
          </View>
          <TouchableOpacity onPress={() => fetchFleet(true)}>
            <Text className="text-red-600 dark:text-red-300 font-black text-xs uppercase tracking-wider">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
      >
        
        {/* Loading State */}
        {loading && fleet.length === 0 ? (
          <View className="px-5 py-6">
            <View className="flex-row space-x-3 mb-6">
              <View className="flex-1 h-20 bg-slate-200 dark:bg-[#161B22] rounded-2xl animate-pulse" />
              <View className="flex-1 h-20 bg-slate-200 dark:bg-[#161B22] rounded-2xl animate-pulse" />
            </View>
            <View className="h-40 bg-slate-200 dark:bg-[#161B22] rounded-2xl mb-4 animate-pulse" />
            <View className="h-40 bg-slate-200 dark:bg-[#161B22] rounded-2xl animate-pulse" />
          </View>
        ) : (
          <>
            {/* Top Summary */}
            <View className="px-5 pt-6 pb-2">
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 bg-white dark:bg-[#161B22] p-4 rounded-2xl border border-slate-100 dark:border-[#30363D] mr-2 shadow-sm">
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <Text className="text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider">Target Displays</Text>
                  </View>
                  <Text className="text-2xl font-black text-slate-900 dark:text-white">{fleet.length}</Text>
                </View>
                <View className="flex-1 bg-white dark:bg-[#161B22] p-4 rounded-2xl border border-slate-100 dark:border-[#30363D] ml-2 shadow-sm">
                  <View className="flex-row items-center mb-1">
                    <PlayCircle size={12} className="text-amber-500 mr-2" />
                    <Text className="text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider">Plays Today</Text>
                  </View>
                  <Text className="text-2xl font-black text-slate-900 dark:text-white">{totalPlays}</Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-1 bg-white dark:bg-[#161B22] p-4 rounded-2xl border border-slate-100 dark:border-[#30363D] mr-2 shadow-sm">
                  <View className="flex-row items-center mb-1">
                    <Car size={12} className="text-blue-500 mr-2" />
                    <Text className="text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider">Vehicles Moving</Text>
                  </View>
                  <Text className="text-xl font-black text-slate-900 dark:text-white">{vehiclesMoving}</Text>
                </View>
                <View className="flex-1 bg-white dark:bg-[#161B22] p-4 rounded-2xl border border-slate-100 dark:border-[#30363D] ml-2 shadow-sm justify-center">
                  <Text className="text-[10px] font-bold text-slate-400 dark:text-[#8B949E] uppercase tracking-wider text-center">Last Updated</Text>
                  <Text className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center mt-1">{getElapsedTimeSeconds()} sec ago</Text>
                </View>
              </View>
            </View>

            {/* Empty State */}
            {fleet.length === 0 ? (
              <View className="px-5 py-10 items-center">
                <MonitorPlay size={48} className="text-slate-300 dark:text-[#30363D] mb-4" />
                <Text className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Target Displays</Text>
                <Text className="text-sm font-medium text-slate-500 dark:text-[#8B949E] text-center max-w-[280px]">
                  No configured displays are currently associated with your active campaigns.
                </Text>
              </View>
            ) : (
              <>
                {/* Target Displays List */}
                <View className="px-5 py-4">
                  <Text className="text-xs font-black text-slate-400 dark:text-[#8B949E] tracking-widest mb-3 uppercase">Target Displays Configured</Text>
                  {fleet.map((vehicle, idx) => {
                    const isVideo = vehicle.media_type === 'video';
                    return (
                      <View key={vehicle.device_id || idx} className="bg-white dark:bg-[#161B22] border border-slate-100 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                            <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">Displaying Now</Text>
                          </View>
                        </View>
                        {(() => {
                          const vType = vehicle.vehicle_type || 'Unknown';
                          const IconComponent = getVehicleIcon(vType);
                          return (
                            <View className="flex-row items-center mb-1">
                              <IconComponent size={18} className="text-slate-700 dark:text-slate-300 mr-2" />
                              <Text className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {vehicle.vehicle_number || vehicle.adsd_id} · {vType.toUpperCase()}
                              </Text>
                            </View>
                          );
                        })()}
                        
                        <View className="flex-row items-center mb-4 mt-2">
                          <View className="bg-slate-100 dark:bg-[#30363D] p-2 rounded-lg mr-3">
                            {isVideo ? <Video size={16} color="#F59E0B" /> : <ImageIcon size={16} color="#F59E0B" />}
                          </View>
                          <View className="flex-1">
                            <Text className="text-slate-900 dark:text-white font-bold">{vehicle.ad_title || 'Your Ad'}</Text>
                            <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-wider mt-0.5">{isVideo ? 'VIDEO' : 'IMAGE'}</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center mb-1">
                          <MapPin size={14} className="text-slate-400 mr-2" />
                          <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm">{vehicle.area || 'Active Zone'}</Text>
                        </View>
                        <View className="mb-4 ml-5">
                          <Text className={`text-[10px] font-bold ${getLocationStatus(vehicle).fresh ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {getLocationStatus(vehicle).text}
                          </Text>
                        </View>

                        {(() => {
                          const liveData = getLiveCostAndDuration(vehicle);
                          return (
                            <View className="mb-4 p-3.5 bg-slate-50 dark:bg-[#0d1117] border border-slate-100 dark:border-[#30363d] rounded-2xl flex-row justify-between items-center">
                              <View>
                                <Text className="text-slate-400 dark:text-[#8b949e] text-[9px] font-black uppercase tracking-widest mb-0.5">Playback Status</Text>
                                <Text className={`text-xs font-black ${liveData.completed ? 'text-slate-500' : 'text-amber-500'}`}>
                                  {liveData.text}
                                </Text>
                              </View>
                              <View className="items-end">
                                <Text className="text-slate-400 dark:text-[#8b949e] text-[9px] font-black uppercase tracking-widest mb-0.5">Est. Cost</Text>
                                <Text className="text-slate-900 dark:text-white font-black text-sm">₹{liveData.cost.toFixed(2)}</Text>
                              </View>
                            </View>
                          );
                        })()}

                        <View className="flex-row justify-between items-center bg-slate-50 dark:bg-[#0D1117] p-3 rounded-xl border border-slate-100 dark:border-[#30363D] mb-4">
                          <View>
                            <Text className="text-[10px] font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider">Started</Text>
                            <Text className="text-slate-900 dark:text-white font-black text-sm">{formatTime(vehicle.started_at)}</Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-[10px] font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider">Plays Today</Text>
                            <Text className="text-slate-900 dark:text-white font-black text-sm">{vehicle.plays_today || 0}</Text>
                          </View>
                        </View>

                        <TouchableOpacity 
                          className="bg-slate-900 dark:bg-white py-3 rounded-xl items-center"
                          onPress={() => setSelectedVehicle(vehicle)}
                        >
                          <Text className="text-white dark:text-slate-900 font-bold text-sm">View Details</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {/* Map Integration */}
                <View className="px-5 mb-10">
                  <Text className="text-xs font-black text-slate-400 dark:text-[#8B949E] tracking-widest mb-3 uppercase">Live Map</Text>
                  <View style={{ height: 300 }} className="rounded-3xl overflow-hidden border border-slate-200 dark:border-[#30363D] shadow-sm">
                    <LiveFleetMap 
                      fleet={fleet}
                      loading={loading}
                      error={error}
                      onSelectVehicle={(v) => setSelectedVehicle(v)}
                      selectedVehicleId={selectedVehicle?.device_id}
                    />
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedVehicle} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-[#161B22] rounded-t-[32px] p-6 shadow-xl border border-slate-100 dark:border-[#30363D]">
            
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center">
                {(() => {
                  const vType = selectedVehicle?.vehicle_type || 'Unknown';
                  const IconComponent = getVehicleIcon(vType);
                  return (
                    <>
                      <View className="bg-slate-100 dark:bg-[#30363D] p-2.5 rounded-2xl mr-3">
                        <IconComponent size={24} className="text-slate-800 dark:text-white" />
                      </View>
                      <View>
                        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {selectedVehicle?.vehicle_number || selectedVehicle?.adsd_id}
                        </Text>
                        <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-xs uppercase tracking-widest">
                          {vType}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
              <TouchableOpacity onPress={() => setSelectedVehicle(null)} className="bg-slate-100 dark:bg-[#30363D] p-2 rounded-full">
                <X size={20} className="text-slate-600 dark:text-white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20 self-start mb-6">
              <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
              <Text className="text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">TARGET DEVICE</Text>
            </View>

            <View className="space-y-4 mb-8">
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Advertisement</Text>
                <Text className="text-slate-900 dark:text-white font-black">{selectedVehicle?.ad_title || 'Your Ad'}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Type</Text>
                <Text className="text-slate-900 dark:text-white font-black uppercase">{selectedVehicle?.media_type === 'video' ? 'VIDEO' : 'IMAGE'}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Started</Text>
                <Text className="text-slate-900 dark:text-white font-black">{formatTime(selectedVehicle?.started_at)}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Today's Plays</Text>
                <Text className="text-slate-900 dark:text-white font-black">{selectedVehicle?.plays_today || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Live Cost (Est.)</Text>
                <Text className="text-amber-500 font-black">
                  ₹{selectedVehicle ? getLiveCostAndDuration(selectedVehicle).cost.toFixed(2) : '0.00'}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Current Location</Text>
                <Text className="text-slate-900 dark:text-white font-black text-right max-w-[200px]" numberOfLines={2}>{selectedVehicle?.area || 'Active Zone'}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-slate-100 dark:border-[#30363D] pb-3">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">GPS Status</Text>
                <Text className={`font-black text-right ${selectedVehicle && getLocationStatus(selectedVehicle).fresh ? 'text-emerald-500' : 'text-amber-500'}`} numberOfLines={2}>
                  {selectedVehicle ? getLocationStatus(selectedVehicle).text : 'Unknown'}
                </Text>
              </View>
              <View className="flex-row justify-between items-center pb-1">
                <Text className="text-slate-500 dark:text-[#8B949E] font-bold text-sm">Distance Travelled Today</Text>
                <Text className="text-slate-900 dark:text-white font-black">{parseFloat(selectedVehicle?.distance_today || 0).toFixed(1)} km</Text>
              </View>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
