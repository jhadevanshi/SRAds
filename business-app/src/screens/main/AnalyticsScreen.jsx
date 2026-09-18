import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { businessService } from '../../services/business';
import { TrendingUp, TrendingDown, PlayCircle, IndianRupee, Megaphone, MonitorSmartphone, Calendar, Info, BarChart3, X } from 'lucide-react-native';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: '7 Days' },
];

// Helper to format date as YYYY-MM-DD
const formatDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AnalyticsScreen() {
  const [range, setRange] = useState('today');
  const [customDate, setCustomDate] = useState(null); // YYYY-MM-DD format
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Calendar Modal State
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const loadAll = useCallback(async (selectedRange, selectedDate) => {
    try {
      setError(null);
      const res = await businessService.getAnalytics(selectedRange, selectedDate);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Unable to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (range === 'custom') {
      loadAll('custom', customDate);
    } else {
      loadAll(range, null);
    }
  }, [range, customDate, loadAll]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      console.log('[AnalyticsScreen] Real-time ad playback completed. Refreshing...');
      if (range === 'custom') {
        loadAll('custom', customDate);
      } else {
        loadAll(range, null);
      }
    });
    return () => subPlayback.remove();
  }, [range, customDate, loadAll]);

  const onRefresh = () => {
    setRefreshing(true);
    if (range === 'custom') {
      loadAll('custom', customDate);
    } else {
      loadAll(range, null);
    }
  };

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toFixed(2)}`;

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
    } catch (e) {
      return dateStr;
    }
  };

  const renderTrend = (value) => {
    if (value === undefined || value === null || range === 'custom') return null;
    const num = parseFloat(value);
    if (num === 0) return <Text className="text-slate-400 text-[10px] font-bold mt-1">No change</Text>;
    if (num === 100 && (range === 'today' || range === 'yesterday')) return <Text className="text-emerald-500 text-[10px] font-bold mt-1">+ New data</Text>;
    
    return (
      <View className="flex-row items-center mt-1">
        {num > 0 ? <TrendingUp size={12} color="#10B981" /> : <TrendingDown size={12} color="#EF4444" />}
        <Text className={`text-[10px] font-bold ml-1 ${num > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {Math.abs(num)}%
        </Text>
      </View>
    );
  };

  // Reusable lightweight month grid generator
  const getDaysInMonth = (year, month) => {
    const days = [];
    const date = new Date(year, month, 1);
    const startOffset = date.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleCalendarDayPress = (day) => {
    if (!day) return;
    const formatted = formatDateString(day);
    setCustomDate(formatted);
    setRange('custom');
    setCalendarVisible(false);
  };

  const openCalendar = () => {
    const initialDate = customDate ? new Date(customDate) : new Date();
    if (!isNaN(initialDate.getTime())) {
      setCurrentYear(initialDate.getFullYear());
      setCurrentMonth(initialDate.getMonth());
    }
    setCalendarVisible(true);
  };

  if (loading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117] justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text className="text-slate-500 mt-4 font-bold">Gathering performance data...</Text>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117] justify-center items-center p-6">
        <View className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-6">
          <Info size={32} className="text-amber-500" />
        </View>
        <Text className="text-slate-900 dark:text-white font-black text-xl tracking-tight mb-2">Performance data is unavailable.</Text>
        <Text className="text-slate-500 dark:text-[#8B949E] text-center text-sm leading-relaxed mb-8">
          We couldn't connect to the analytics servers right now. Please try again.
        </Text>
        <TouchableOpacity onPress={onRefresh} className="bg-[#F59E0B] px-8 py-4 rounded-full shadow-lg shadow-amber-500/30">
          <Text className="text-white font-black">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { summary, comparison, campaignPerformance } = data || {};

  // Check if there is genuinely no playback activity for selected date/range
  const hasNoActivity = !summary || (parseInt(summary.totalPlays || 0) === 0 && parseFloat(summary.totalSpend || 0) === 0);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] z-10">
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Brand Performance</Text>
      </View>

      {/* Date Controls */}
      <View className="px-5 py-4 bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-[#1F2937] flex-row items-center justify-between">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row flex-1 mr-3">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => {
                setRange(tab.id);
                setCustomDate(null);
              }}
              className={`px-5 py-2.5 rounded-full mr-2 ${range === tab.id ? 'bg-[#F59E0B]' : 'bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D]'}`}
            >
              <Text className={`font-bold text-sm ${range === tab.id ? 'text-white' : 'text-slate-600 dark:text-[#8B949E]'}`}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
          
          {range === 'custom' && customDate && (
            <TouchableOpacity
              onPress={openCalendar}
              className="px-5 py-2.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-[#F59E0B] mr-2"
            >
              <Text className="font-bold text-sm text-[#F59E0B]">📅 {customDate}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <TouchableOpacity 
          onPress={openCalendar}
          className={`p-2.5 rounded-full border ${range === 'custom' ? 'bg-[#F59E0B] border-[#F59E0B]' : 'bg-slate-50 dark:bg-[#161B22] border-slate-200 dark:border-[#30363D]'}`}
        >
          <Calendar size={18} color={range === 'custom' ? '#FFF' : '#F59E0B'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 pt-6">
          
          {hasNoActivity ? (
            <View className="items-center mt-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-8 shadow-sm">
              <View className="w-16 h-16 bg-slate-50 dark:bg-[#0D1117] rounded-full items-center justify-center mb-5">
                <BarChart3 size={28} className="text-slate-400" />
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black tracking-tight mb-2 text-center">NO PLAYBACK ACTIVITY</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-4 px-4">
                No advertisements were played during this period.
              </Text>
              <TouchableOpacity onPress={openCalendar} className="bg-slate-900 dark:bg-white px-5 py-2.5 rounded-full">
                <Text className="text-white dark:text-slate-900 font-bold text-xs">Try selecting another date</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Metric Cards */}
              <View className="flex-row flex-wrap justify-between mb-4">
                
                {/* Plays Card */}
                <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center mb-3">
                    <PlayCircle size={20} className="text-blue-500" />
                  </View>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-wider mb-1">TOTAL PLAYS</Text>
                  <Text className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                    {summary?.totalPlays?.toLocaleString() || 0}
                  </Text>
                  {renderTrend(comparison?.playsChange)}
                </View>

                {/* Spend Card */}
                <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl items-center justify-center mb-3">
                    <IndianRupee size={20} className="text-emerald-500" />
                  </View>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-wider mb-1">TOTAL SPEND</Text>
                  <Text className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                    {formatCurrency(summary?.totalSpend)}
                  </Text>
                  {renderTrend(comparison?.spendChange)}
                </View>

                {/* Active Screens Card */}
                <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-2xl items-center justify-center mb-3">
                    <MonitorSmartphone size={20} className="text-amber-500" />
                  </View>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-wider mb-1">ACTIVE SCREENS</Text>
                  <Text className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                    {summary?.activeDisplays || 0}
                  </Text>
                </View>

                {/* Ads Running Card */}
                <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-2xl items-center justify-center mb-3">
                    <Megaphone size={20} className="text-purple-500" />
                  </View>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-wider mb-1">ADS RUNNING</Text>
                  <Text className="text-slate-900 dark:text-white text-2xl font-black tracking-tight">
                    {summary?.activeCampaigns || 0}
                  </Text>
                </View>

              </View>

              {/* Advertisement Performance list */}
              {campaignPerformance && campaignPerformance.length > 0 && (
                <>
                  <Text className="text-sm font-black text-slate-900 dark:text-white tracking-tight mb-4 uppercase">ADVERTISEMENT PERFORMANCE</Text>
                  {campaignPerformance.map(camp => (
                    <View key={camp.id} className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
                      <View className="flex-row justify-between items-start mb-4 border-b border-slate-100 dark:border-[#30363D] pb-4">
                        <View className="flex-1 pr-2">
                          <Text className="text-slate-900 dark:text-white font-black text-lg mb-1" numberOfLines={1}>{camp.name}</Text>
                          <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-1.5 ${camp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <Text className={`text-xs font-bold ${camp.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>{camp.status}</Text>
                          </View>
                        </View>
                        <View className="bg-slate-50 dark:bg-[#0D1117] border border-slate-100 dark:border-[#30363D] px-2.5 py-1.5 rounded-lg">
                          <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-bold">
                            {safeFormatDate(camp.start_date)} - {safeFormatDate(camp.end_date)}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Plays</Text>
                          <Text className="text-slate-900 dark:text-white font-bold text-base">{camp.plays?.toLocaleString() || 0}</Text>
                        </View>
                        <View>
                          <Text className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Spend</Text>
                          <Text className="text-slate-900 dark:text-white font-bold text-base">{formatCurrency(camp.spend)}</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">Target Screens</Text>
                          <Text className="text-slate-900 dark:text-white font-bold text-base">{camp.displays || 0}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}

        </View>
      </ScrollView>

      {/* CUSTOM CALENDAR MODAL */}
      <Modal visible={calendarVisible} transparent animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <View className="flex-1 justify-end bg-slate-900/60 dark:bg-black/80">
          <View className="bg-white dark:bg-[#161B22] rounded-t-[32px] p-6 pb-12 border-t border-slate-100 dark:border-[#30363D]">
            
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-black text-slate-900 dark:text-white">Select Custom Date</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)} className="p-2 rounded-full bg-slate-100 dark:bg-[#30363D]">
                <X size={18} className="text-slate-500 dark:text-[#8B949E]" />
              </TouchableOpacity>
            </View>

            {/* Calendar Controls */}
            <View className="flex-row justify-between items-center mb-5 px-2">
              <TouchableOpacity 
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-2 border border-slate-200 dark:border-[#30363D] rounded-xl"
              >
                <Text className="text-slate-500 dark:text-white font-black">&lt;</Text>
              </TouchableOpacity>
              <Text className="text-slate-900 dark:text-white font-black text-base">
                {new Date(currentYear, currentMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="p-2 border border-slate-200 dark:border-[#30363D] rounded-xl"
              >
                <Text className="text-slate-500 dark:text-white font-black">&gt;</Text>
              </TouchableOpacity>
            </View>

            {/* Week Headers */}
            <View className="flex-row justify-between mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(header => (
                <View key={header} className="w-[14%] items-center">
                  <Text className="text-slate-400 text-xs font-black uppercase">{header}</Text>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View className="flex-row flex-wrap justify-between">
              {getDaysInMonth(currentYear, currentMonth).map((day, idx) => {
                const isSelected = day && customDate === formatDateString(day);
                return (
                  <TouchableOpacity 
                    key={day ? day.getTime() : `empty-${idx}`}
                    disabled={!day}
                    onPress={() => handleCalendarDayPress(day)}
                    className={`w-[14%] h-12 items-center justify-center rounded-xl mb-1 ${isSelected ? 'bg-[#F59E0B]' : 'bg-transparent'}`}
                  >
                    <Text className={`font-black text-sm ${!day ? 'text-transparent' : isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {day ? day.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
