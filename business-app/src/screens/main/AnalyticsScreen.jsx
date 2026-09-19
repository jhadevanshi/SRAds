import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { businessService } from '../../services/business';
import { 
  TrendingUp, 
  TrendingDown, 
  PlayCircle, 
  IndianRupee, 
  Megaphone, 
  MonitorSmartphone, 
  Calendar, 
  Info, 
  BarChart3, 
  X,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import AnimatedBarChart from '../../components/AnimatedBarChart';
import { colors } from '../../theme/designTokens';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: '7 Days' },
];

const formatDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AnalyticsScreen({ route }) {
  const { isDark } = useTheme();
  const [range, setRange] = useState('today');
  const [customDate, setCustomDate] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Unable to load analytics data.');
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
    if (!dateStr) return 'Active Flight';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
    } catch (e) {
      return dateStr;
    }
  };

  const renderTrend = (value) => {
    if (value === undefined || value === null || range === 'custom') return null;
    const num = parseFloat(value);
    if (num === 0) return <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold mt-1.5">No change</Text>;
    if (num === 100 && (range === 'today' || range === 'yesterday')) return <Text className="text-emerald-400 text-[10px] font-bold mt-1.5">+ Fresh playback</Text>;
    
    return (
      <View className="flex-row items-center mt-1.5">
        {num > 0 ? <TrendingUp size={12} color="#10B981" /> : <TrendingDown size={12} color="#EF4444" />}
        <Text className={`text-[10px] font-bold ml-1 ${num > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {Math.abs(num)}% vs prev period
        </Text>
      </View>
    );
  };

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
      <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-3">Compiling performance analytics...</Text>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1 justify-center items-center p-6">
        <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="w-20 h-20 rounded-3xl items-center justify-center mb-5">
          <Info size={32} color="#A855F7" />
        </View>
        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xl tracking-tight mb-2">Performance Data Unavailable</Text>
        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm leading-relaxed mb-6 px-4">
          Failed to retrieve playback stats from the analytics engine.
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="rounded-full overflow-hidden shadow-lg"
          style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="px-8 py-3.5 items-center justify-center"
          >
            <Text className="text-white font-black text-sm">Retry Connection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { summary, comparison, campaignPerformance, hourlyData, weeklyData } = data || {};
  const hasNoActivity = !summary || (parseInt(summary.totalPlays || 0) === 0 && parseFloat(summary.totalSpend || 0) === 0);

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
        className="flex-row justify-between items-center px-5 py-4 border-b z-10"
      >
        <View>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight">
            Analytics
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-0.5">
            Real-Time Broadcast Intelligence
          </Text>
        </View>

        <TouchableOpacity 
          onPress={openCalendar}
          style={{ 
            backgroundColor: range === 'custom' ? '#7C3AED' : (isDark ? '#1F1735' : '#F1F5F9'),
            borderColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="p-2.5 rounded-full border shadow-sm"
        >
          <Calendar size={18} color={range === 'custom' ? '#FFF' : '#A855F7'} />
        </TouchableOpacity>
      </View>

      {/* Date Range Tabs */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="px-5 py-3 border-b flex-row items-center justify-between"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row flex-1 mr-2">
          {TABS.map((tab) => {
            const isSelected = range === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  setRange(tab.id);
                  setCustomDate(null);
                }}
                style={{
                  backgroundColor: isSelected 
                    ? '#7C3AED' 
                    : (isDark ? '#181033' : '#F8F7FF'),
                  borderColor: isSelected 
                    ? '#9333EA' 
                    : (isDark ? '#281B4B' : '#EDE9FE'),
                }}
                className="px-4 py-1.5 rounded-full border mr-2"
              >
                <Text 
                  style={{
                    color: isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                    fontWeight: isSelected ? '800' : '600',
                  }}
                  className="text-xs"
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {range === 'custom' && customDate && (
            <TouchableOpacity
              onPress={openCalendar}
              style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: '#7C3AED' }}
              className="px-4 py-1.5 rounded-full border flex-row items-center mr-2"
            >
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-bold text-xs">
                📅 {customDate}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
        contentContainerStyle={{ padding: 18, paddingBottom: 110 }}
      >
        {hasNoActivity ? (
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="items-center mt-6 border rounded-3xl p-8 shadow-sm"
          >
            <LinearGradient
              colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
            >
              <BarChart3 size={28} color={isDark ? '#FFFFFF' : '#7C3AED'} />
            </LinearGradient>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-lg tracking-tight mb-1 text-center">
              No Broadcast Activity
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-xs leading-relaxed mb-5 px-4">
              No screen playbacks were recorded during the selected period.
            </Text>
            <TouchableOpacity 
              onPress={openCalendar} 
              style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }}
              className="px-5 py-2.5 rounded-full"
            >
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-bold text-xs">Select Another Date</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 4-Metric Grid */}
            <View className="flex-row flex-wrap justify-between mb-2">
              
              {/* Total Plays */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  width: '48%' 
                }}
                className="border rounded-3xl p-4 mb-3.5 shadow-sm"
              >
                <View style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)' }} className="w-10 h-10 rounded-2xl items-center justify-center mb-2.5">
                  <PlayCircle size={20} color="#A855F7" />
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider mb-0.5">Total Plays</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight">
                  {summary?.totalPlays?.toLocaleString('en-IN') || 0}
                </Text>
                {renderTrend(comparison?.playsChange)}
              </View>

              {/* Total Spend */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  width: '48%' 
                }}
                className="border rounded-3xl p-4 mb-3.5 shadow-sm"
              >
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }} className="w-10 h-10 rounded-2xl items-center justify-center mb-2.5">
                  <IndianRupee size={18} color="#10B981" />
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider mb-0.5">Spend</Text>
                <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="text-2xl font-black tracking-tight">
                  {formatCurrency(summary?.totalSpend)}
                </Text>
                {renderTrend(comparison?.spendChange)}
              </View>

              {/* Active Screens */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  width: '48%' 
                }}
                className="border rounded-3xl p-4 mb-3.5 shadow-sm"
              >
                <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)' }} className="w-10 h-10 rounded-2xl items-center justify-center mb-2.5">
                  <MonitorSmartphone size={18} color="#38BDF8" />
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider mb-0.5">Active Screens</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight">
                  {summary?.activeDisplays || 0}
                </Text>
              </View>

              {/* Campaigns Running */}
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  width: '48%' 
                }}
                className="border rounded-3xl p-4 mb-3.5 shadow-sm"
              >
                <View style={{ backgroundColor: 'rgba(217, 70, 239, 0.12)' }} className="w-10 h-10 rounded-2xl items-center justify-center mb-2.5">
                  <Megaphone size={18} color="#D946EF" />
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-black uppercase tracking-wider mb-0.5">Campaigns</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight">
                  {summary?.activeCampaigns || 0}
                </Text>
              </View>

            </View>

            {/* Campaign Breakdown List */}
            {campaignPerformance && campaignPerformance.length > 0 && (
              <View className="mt-3">
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black uppercase tracking-wider mb-3">
                  Campaign Breakdown
                </Text>
                
                {campaignPerformance.map(camp => (
                  <View 
                    key={camp.id} 
                    style={{ 
                      backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                      borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                    }}
                    className="border rounded-3xl p-5 mb-3.5 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-3 border-b pb-3" style={{ borderColor: isDark ? '#281B4B' : '#F1F5F9' }}>
                      <View className="flex-1 pr-2">
                        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base mb-1" numberOfLines={1}>
                          {camp.name}
                        </Text>
                        <View className="flex-row items-center">
                          <View className={`w-2 h-2 rounded-full mr-1.5 ${camp.status === 'Active' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                          <Text style={{ color: camp.status === 'Active' ? '#10B981' : '#A855F7' }} className="text-[11px] font-bold uppercase">
                            {camp.status}
                          </Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }} className="px-2.5 py-1 rounded-lg">
                        <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-bold">
                          {safeFormatDate(camp.start_date)} – {safeFormatDate(camp.end_date)}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between pt-1">
                      <View>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase mb-0.5">Plays</Text>
                        <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-black text-sm">{camp.plays?.toLocaleString('en-IN') || 0}</Text>
                      </View>
                      <View>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase mb-0.5">Spend</Text>
                        <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="font-black text-sm">{formatCurrency(camp.spend)}</Text>
                      </View>
                      <View className="items-end">
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase mb-0.5">Displays</Text>
                        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">{camp.displays || 0}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} transparent animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <View className="flex-1 justify-end bg-black/75">
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="rounded-t-[32px] p-6 pb-12 border-t shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-lg font-black tracking-tight">
                Select Analytics Date
              </Text>
              <TouchableOpacity 
                onPress={() => setCalendarVisible(false)} 
                style={{ backgroundColor: isDark ? '#1F1735' : '#F1F5F9' }}
                className="p-2 rounded-full"
              >
                <X size={18} color={isDark ? '#CBD5E1' : '#475569'} />
              </TouchableOpacity>
            </View>

            {/* Calendar Controls */}
            <View className="flex-row justify-between items-center mb-4 px-2">
              <TouchableOpacity 
                onPress={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                style={{ backgroundColor: isDark ? '#181033' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
                className="p-2.5 border rounded-xl"
              >
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-black">&lt;</Text>
              </TouchableOpacity>
              
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-base">
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
                style={{ backgroundColor: isDark ? '#181033' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
                className="p-2.5 border rounded-xl"
              >
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-black">&gt;</Text>
              </TouchableOpacity>
            </View>

            {/* Week Headers */}
            <View className="flex-row justify-between mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(header => (
                <View key={header} className="w-[14%] items-center">
                  <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-xs font-black uppercase">{header}</Text>
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
                    style={{
                      backgroundColor: isSelected ? '#7C3AED' : 'transparent',
                    }}
                    className="w-[14%] h-11 items-center justify-center rounded-xl mb-1"
                  >
                    <Text 
                      style={{ 
                        color: !day ? 'transparent' : isSelected ? '#FFFFFF' : (isDark ? '#F8FAFC' : '#1E1B4B'),
                        fontWeight: isSelected ? '900' : '600'
                      }}
                      className="text-sm"
                    >
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
