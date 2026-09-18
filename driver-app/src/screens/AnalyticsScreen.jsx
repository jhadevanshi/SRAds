import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingBottomNav from '../components/FloatingBottomNav';
import AnimatedBarChart from '../components/AnimatedBarChart';
import api from '../services/api';

export default function AnalyticsScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/driver/history')
      .then(res => setHistory(res.data.history))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  const maxIncome = Math.max(...history.map(h => Number(h.income) || 0), 1);
  const maxDist = Math.max(...history.map(h => Number(h.distance_km) || 0), 1);
  const maxMins = Math.max(...history.map(h => Number(h.active_minutes) || 0), 1);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 bg-white shadow-sm z-10 border-b border-slate-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Financial Performance</Text>
        <AnimatedBarChart 
          title="Weekly Earnings"
          data={history}
          dataKey="income"
          maxValue={maxIncome}
          formatValue={v => `₹${v.toFixed(0)}`}
          barColor="bg-emerald-200"
          activeBarColor="bg-emerald-500"
        />

        <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Physical Travel</Text>
        <AnimatedBarChart 
          title="Distance Covered"
          data={history}
          dataKey="distance_km"
          maxValue={maxDist}
          formatValue={v => `${v.toFixed(1)} km`}
          barColor="bg-blue-200"
          activeBarColor="bg-blue-500"
        />
        
        <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Engagement</Text>
        <AnimatedBarChart 
          title="Active Hours"
          data={history}
          dataKey="active_minutes"
          maxValue={maxMins}
          formatValue={v => `${(v/60).toFixed(1)}h`}
          barColor="bg-indigo-200"
          activeBarColor="bg-indigo-500"
        />
      </ScrollView>

      <FloatingBottomNav />
    </SafeAreaView>
  );
}
