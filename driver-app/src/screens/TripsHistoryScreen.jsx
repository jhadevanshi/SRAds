import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Calendar, Clock, Navigation2, FileText } from 'lucide-react-native';
import FloatingBottomNav from '../components/FloatingBottomNav';
import api from '../services/api';

export default function TripsHistoryScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await api.get('/driver/trips');
      setTrips(res.data.trips || []);
    } catch (e) {
      if (e.response?.status !== 401) console.error("Trips error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 bg-white shadow-sm z-10 border-b border-slate-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900 tracking-tight">Trips</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-6" 
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTrips(true)} />}
      >
        {trips.length > 0 ? trips.map((trip) => (
          <View key={trip.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 mb-5">
            <View className="p-5">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-slate-900 font-bold text-lg">Daily Shift Summary</Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <Navigation2 size={12} color="#10B981" />
                    <Text className="text-slate-500 text-sm font-medium">{trip.status}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between bg-slate-50 p-3 rounded-2xl">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color="#64748B" />
                  <Text className="text-slate-700 text-xs font-bold">{new Date(trip.date).toLocaleDateString()}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Navigation2 size={16} color="#64748B" />
                  <Text className="text-slate-700 text-xs font-bold">{trip.distance_km} km</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Clock size={16} color="#64748B" />
                  <Text className="text-slate-700 text-xs font-bold">{Math.floor(trip.active_minutes / 60)}h {trip.active_minutes % 60}m</Text>
                </View>
              </View>
            </View>
          </View>
        )) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
              <FileText size={32} color="#94A3B8" />
            </View>
            <Text className="text-lg font-bold text-slate-900 mb-2">No trips recorded yet</Text>
            <Text className="text-slate-500 text-center max-w-[250px]">
              Once you start driving and your status is Active, your shift summaries will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <FloatingBottomNav />
    </SafeAreaView>
  );
}
