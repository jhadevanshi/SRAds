import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';
import { 
  Wallet, PlayCircle, IndianRupee, Video, Image as ImageIcon, 
  MapPin, Clock, Settings, Plus, Building2, Navigation, Megaphone, MonitorSmartphone,
  ChevronRight, ArrowRight, BarChart3
} from 'lucide-react-native';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [liveFleet, setLiveFleet] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, fleetRes, campRes] = await Promise.all([
        businessService.getDashboard(),
        businessService.getLiveFleet().catch(() => ({ success: false, fleet: [] })), // Graceful degradation
        businessService.getCampaigns().catch(() => ({ success: false, campaigns: [] }))
      ]);

      if (dashRes.success) setStats(dashRes);
      if (fleetRes.success && fleetRes.fleet) setLiveFleet(fleetRes.fleet);
      if (campRes.success && campRes.campaigns) setCampaigns(campRes.campaigns.slice(0, 3)); // Only show top 3 recent
    } catch (err) {
      console.error('Error fetching dashboard', err);
      setError('Unable to load some dashboard information.');
    }
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
    const liveInterval = setInterval(fetchData, 15000);
    return () => clearInterval(liveInterval);
  }, [fetchData]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      console.log('[DashboardScreen] Real-time ad playback completed. Refreshing...');
      fetchData();
    });
    const subStatus = DeviceEventEmitter.addListener('DEVICE_STATUS_UPDATED', () => {
      console.log('[DashboardScreen] Real-time device status updated. Refreshing...');
      fetchData();
    });
    const subCampaign = DeviceEventEmitter.addListener('CAMPAIGN_UPDATED', () => {
      console.log('[DashboardScreen] Real-time campaign status updated. Refreshing...');
      fetchData();
    });

    return () => {
      subPlayback.remove();
      subStatus.remove();
      subCampaign.remove();
    };
  }, [fetchData]);

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toFixed(2)}`;

  if (loading && !stats) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117] justify-center items-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  const renderCampaignStatus = (campaign) => {
    if (campaign.approval_status === 'Pending' || (campaign.pending_ad_count && parseInt(campaign.pending_ad_count) > 0)) {
      return (
        <View className="bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-500/20">
          <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">Pending Approval</Text>
        </View>
      );
    }
    if (campaign.approval_status === 'Rejected' || (campaign.rejected_ad_count && parseInt(campaign.rejected_ad_count) > 0)) {
      return (
        <View className="bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md border border-red-100 dark:border-red-500/20">
          <Text className="text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">Rejected</Text>
        </View>
      );
    }
    if (campaign.status?.toLowerCase() === 'active') {
      return (
        <View className="bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
          <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">Active</Text>
        </View>
      );
    }
    return (
      <View className="bg-slate-100 dark:bg-[#30363D] px-2 py-1 rounded-md border border-slate-200 dark:border-[#4B5563]">
        <Text className="text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">{campaign.status}</Text>
      </View>
    );
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const totalAds = stats?.stats?.total_ads || 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      {/* Premium Header */}
      <View className="px-5 py-4 flex-row items-center justify-between bg-[#F8FAFC] dark:bg-[#0D1117] z-10 border-b border-slate-100 dark:border-[#1F2937]">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl items-center justify-center border border-amber-200 dark:border-amber-700/50 mr-3">
            <Building2 size={22} className="text-amber-600 dark:text-amber-400" />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] uppercase tracking-wider mb-0.5">Welcome back, 👋</Text>
            <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight" numberOfLines={1}>{user?.company_name || 'Advertiser'}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#161B22] items-center justify-center shadow-sm border border-slate-200 dark:border-[#30363D]"
        >
          <Settings size={20} className="text-slate-600 dark:text-[#8B949E]" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-5 py-4">

          {/* Hero Section */}
          <View className="bg-slate-900 dark:bg-[#161B22] rounded-3xl p-6 mb-6 shadow-xl shadow-slate-900/20 overflow-hidden relative">
            {/* Decorative background elements */}
            <View className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
            <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
            
            <Text className="text-white text-2xl font-black tracking-tight mb-2">Put your brand in front of BRT commuters 🚍</Text>
            <Text className="text-slate-300 text-sm leading-relaxed mb-6 max-w-[90%]">
              {totalAds === 0 
                ? "Upload your advertisement and choose where and when it should appear."
                : "Choose where and when your uploaded advertisements should appear."
              }
            </Text>
            
            <View className="flex-row items-center space-x-3">
              {totalAds === 0 ? (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('CreateCampaign')} 
                  className="bg-[#F59E0B] px-5 py-3 rounded-full flex-row items-center shadow-lg shadow-amber-500/30"
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={3} />
                  <Text className="text-white font-bold ml-1.5 text-sm">Launch Your Ad</Text>
                </TouchableOpacity>
              ) : campaigns.length === 0 ? (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('CreateCampaign')} 
                  className="bg-[#F59E0B] px-5 py-3 rounded-full flex-row items-center shadow-lg shadow-amber-500/30"
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={3} />
                  <Text className="text-white font-bold ml-1.5 text-sm">Launch Your Ad</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('My Ads')} 
                  className="bg-[#F59E0B] px-5 py-3 rounded-full flex-row items-center shadow-lg shadow-amber-500/30"
                >
                  <Text className="text-white font-bold text-sm px-2">View My Ads</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Network Error State */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 mb-6 flex-row items-center">
              <View className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full items-center justify-center mr-3">
                <Settings size={20} className="text-red-600 dark:text-red-400" />
              </View>
              <View className="flex-1">
                <Text className="text-red-800 dark:text-red-300 font-bold mb-0.5">Connection Issue</Text>
                <Text className="text-red-600 dark:text-red-400 text-xs">{error}</Text>
              </View>
              <TouchableOpacity onPress={onRefresh} className="bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded-full">
                <Text className="text-red-700 dark:text-red-300 font-bold text-xs">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Section A: Active Ads */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-black text-slate-800 dark:text-white tracking-tight uppercase">My Ads</Text>
            <TouchableOpacity onPress={() => navigation.navigate('My Ads')} className="flex-row items-center">
              <Text className="text-amber-500 font-bold text-xs mr-1">View All</Text>
              <ArrowRight size={14} color="#F59E0B" />
            </TouchableOpacity>
          </View>

          {campaigns.length === 0 ? (
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-6 items-center shadow-sm mb-6">
              <View className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-4">
                <Megaphone size={28} className="text-amber-500" />
              </View>
              <Text className="text-slate-900 dark:text-white font-black text-lg mb-2 text-center">Start advertising on BRT screens 🚍</Text>
              <Text className="text-slate-500 dark:text-[#8B949E] text-center text-sm leading-relaxed mb-5 px-4">
                Choose where and when you want your advertisement displayed.
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('CreateCampaign')}
                className="bg-slate-900 dark:bg-white px-6 py-3 rounded-full shadow-sm"
              >
                <Text className="text-white dark:text-slate-900 font-bold text-sm">
                  Launch Your First Ad
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-5 px-5">
              {campaigns.map((campaign, idx) => (
                <TouchableOpacity 
                  key={campaign.id || idx}
                  onPress={() => navigation.navigate('My Ads')}
                  className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-4 mr-4 w-64 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-900 dark:text-white font-black text-base tracking-tight mb-1" numberOfLines={1}>{campaign.campaign_name}</Text>
                      <View className="flex-row items-center">
                        <MapPin size={12} className="text-slate-400" />
                        <Text className="text-slate-500 text-xs font-medium ml-1" numberOfLines={1}>{campaign.area || 'All Areas'}</Text>
                      </View>
                    </View>
                    {renderCampaignStatus(campaign)}
                  </View>

                  <View className="flex-row justify-between items-center bg-slate-50 dark:bg-[#0D1117] p-3 rounded-2xl border border-slate-100 dark:border-[#30363D]">
                    <View>
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Spend</Text>
                      <Text className="text-slate-800 dark:text-slate-200 font-bold">{formatCurrency(campaign.total_spend || 0)}</Text>
                    </View>
                    <View className="h-6 w-px bg-slate-200 dark:bg-[#30363D]" />
                    <View className="items-end">
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Plays</Text>
                      <Text className="text-slate-800 dark:text-slate-200 font-bold">{campaign.total_plays || 0}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Section B: Configured Display Network */}
          <Text className="text-sm font-black text-slate-800 dark:text-white tracking-tight uppercase mb-4 mt-2">Configured Display Network</Text>
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 shadow-sm mb-8">
            <View className="flex-row justify-between items-center mb-5 pb-5 border-b border-slate-100 dark:border-[#30363D]">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center mr-3">
                  <MonitorSmartphone size={24} className="text-blue-500" />
                </View>
                <View>
                  <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest mb-0.5">Target Displays Configured</Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-900 dark:text-white font-black text-2xl tracking-tight mr-2">{liveFleet.length}</Text>
                    {liveFleet.length > 0 && <View className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('LiveFleet')} className="bg-slate-50 dark:bg-[#0D1117] p-2.5 rounded-full border border-slate-200 dark:border-[#30363D]">
                <ChevronRight size={20} className="text-slate-400" />
              </TouchableOpacity>
            </View>

            {liveFleet.length === 0 ? (
              <View className="items-center py-2">
                <Text className="text-slate-500 dark:text-slate-400 text-sm text-center">
                  Your ads are not playing on any screens right now. Check your active ads or create a new one.
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Target Network</Text>
                {liveFleet.slice(0, 2).map((vehicle, index) => (
                  <View key={index} className="flex-row justify-between items-center bg-slate-50 dark:bg-[#0D1117] p-3 rounded-xl mb-2">
                    <View className="flex-row items-center">
                      <MapPin size={14} className="text-slate-400 mr-2" />
                      <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">{vehicle.area || 'Active Zone'}</Text>
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs">BRT {vehicle.vehicle_number}</Text>
                  </View>
                ))}
                {liveFleet.length > 2 && (
                  <TouchableOpacity onPress={() => navigation.navigate('LiveFleet')} className="mt-2 items-center">
                    <Text className="text-amber-500 font-bold text-xs">View all {liveFleet.length} target screens</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Section C: Performance */}
          <Text className="text-sm font-black text-slate-800 dark:text-white tracking-tight uppercase mb-4">Performance Overview</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Wallet / Spend */}
            <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl items-center justify-center mb-4">
                <Wallet size={20} className="text-emerald-500" />
              </View>
              <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-medium mb-1">Available Budget</Text>
              <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight mb-4" adjustsFontSizeToFit numberOfLines={1}>
                {formatCurrency(stats?.wallet_balance)}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddMoney')}
                className="bg-slate-50 dark:bg-[#0D1117] py-2 px-3 rounded-xl flex-row items-center justify-center border border-slate-200 dark:border-[#30363D]"
              >
                <Plus size={14} className="text-slate-600 dark:text-slate-300" />
                <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold ml-1">Add Funds</Text>
              </TouchableOpacity>
            </View>

            {/* Plays */}
            <View className="w-[48%] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-2xl items-center justify-center mb-4">
                <BarChart3 size={20} className="text-purple-500" />
              </View>
              <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-medium mb-1">Times Played (Today)</Text>
              <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight mb-4" adjustsFontSizeToFit numberOfLines={1}>
                {stats?.today_plays || 0}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Analytics')}
                className="bg-slate-50 dark:bg-[#0D1117] py-2 px-3 rounded-xl flex-row items-center justify-center border border-slate-200 dark:border-[#30363D]"
              >
                <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold mr-1">View Analytics</Text>
                <ArrowRight size={14} className="text-slate-600 dark:text-slate-300" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
