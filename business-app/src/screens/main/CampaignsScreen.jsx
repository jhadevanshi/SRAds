import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { businessService } from '../../services/business';
import { Plus, Megaphone, MapPin, Play, Pause, Trash2, Calendar, MonitorSmartphone, IndianRupee, ChevronDown, ChevronUp } from 'lucide-react-native';

export default function CampaignsScreen({ navigation }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await businessService.getCampaigns();
      if (res.success) {
        setCampaigns(res.campaigns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(() => {
      if (!loading && !refreshing) fetchCampaigns();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchCampaigns, loading, refreshing]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      console.log('[CampaignsScreen] Real-time ad playback completed. Refreshing...');
      fetchCampaigns();
    });
    const subCampaign = DeviceEventEmitter.addListener('CAMPAIGN_UPDATED', () => {
      console.log('[CampaignsScreen] Real-time campaign updated. Refreshing...');
      fetchCampaigns();
    });
    return () => {
      subPlayback.remove();
      subCampaign.remove();
    };
  }, [fetchCampaigns]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCampaignStatus = (item) => {
    if (item.approval_status === 'Pending' || (item.pending_ad_count && parseInt(item.pending_ad_count) > 0)) {
      return { text: 'Pending Admin Approval', color: 'amber' };
    }
    if (item.approval_status === 'Rejected' || (item.rejected_ad_count && parseInt(item.rejected_ad_count) > 0)) {
      return { text: 'Rejected', color: 'red' };
    }
    switch(item.status?.toLowerCase()) {
      case 'active': return { text: 'Active', color: 'emerald' };
      case 'scheduled': return { text: 'Scheduled', color: 'amber' };
      case 'paused': return { text: 'Paused', color: 'slate' };
      case 'completed': return { text: 'Completed', color: 'blue' };
      default: return { text: item.status || 'Paused', color: 'slate' };
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const statusInfo = getCampaignStatus(item);
    const sColor = statusInfo.color;

    return (
      <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl mb-5 shadow-sm overflow-hidden">
        {/* Card Header (Always Visible) */}
        <TouchableOpacity 
          onPress={() => toggleExpand(item.id)}
          className="p-5 flex-row justify-between items-start"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1">
            <View className={`bg-${sColor}-50 dark:bg-${sColor}-500/10 p-3 rounded-2xl mr-4 border border-${sColor}-100 dark:border-${sColor}-500/20`}>
              <Megaphone size={20} className={`text-${sColor}-500`} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight mb-1" numberOfLines={1}>{item.campaign_name}</Text>
              <View className="flex-row items-center">
                <View className={`w-2 h-2 rounded-full bg-${sColor}-500 mr-1.5`} />
                <Text className={`text-${sColor}-600 dark:text-${sColor}-400 text-xs font-bold uppercase tracking-wider`}>{statusInfo.text}</Text>
              </View>
            </View>
          </View>
          
          <View className="items-end justify-center h-12">
            {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-[#1F2937]">
            
            {/* Status explanation */}
            {(item.approval_status === 'Pending' || (item.pending_ad_count && parseInt(item.pending_ad_count) > 0)) && (
              <View className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex-row items-start gap-3">
                <Text className="text-amber-500 text-lg">🟠</Text>
                <View className="flex-1">
                  <Text className="text-amber-900 dark:text-amber-300 font-black text-sm uppercase tracking-wide">Awaiting Approval</Text>
                  <Text className="text-amber-700 dark:text-amber-400 text-xs mt-1 font-medium leading-relaxed">
                    Your ad has been submitted and is waiting for review. It will become active once reviewed and approved by the administrator.
                  </Text>
                </View>
              </View>
            )}

            {(item.approval_status === 'Rejected' || (item.rejected_ad_count && parseInt(item.rejected_ad_count) > 0)) && (
              <View className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex-row items-start gap-3">
                <Text className="text-red-500 text-lg">🔴</Text>
                <View className="flex-1">
                  <Text className="text-red-950 dark:text-red-300 font-black text-sm uppercase tracking-wide">Rejected by Admin</Text>
                  <Text className="text-red-700 dark:text-red-400 text-xs mt-1 font-medium leading-relaxed">
                    This campaign or its ads were rejected. Reason: {item.rejection_reason || item.ad_rejection_reasons || 'No reason provided by the administrator.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Where & When */}
            <View className="flex-row justify-between mb-6 pt-4">
              <View className="flex-1 mr-2">
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Where</Text>
                <View className="flex-row items-center mb-1">
                  <MapPin size={14} className="text-slate-500 mr-1.5" />
                  <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm" numberOfLines={1}>{item.area}</Text>
                </View>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Schedule</Text>
                <View className="flex-row items-center">
                  <Calendar size={14} className="text-slate-500 mr-1.5" />
                  <Text className="text-slate-700 dark:text-slate-300 font-bold text-sm">
                    {new Date(item.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(item.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </Text>
                </View>
              </View>
            </View>

            {/* Performance Stats */}
            <View className="bg-slate-50 dark:bg-[#0D1117] rounded-2xl p-4 mb-6 border border-slate-200 dark:border-[#30363D]">
              <View className="flex-row flex-wrap justify-between">
                <View className="w-1/2 mb-4 pr-2">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-xs mr-1">▶️</Text>
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Plays</Text>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-black text-lg">{Number(item.total_plays || 0).toLocaleString('en-IN')}</Text>
                </View>
                <View className="w-1/2 mb-4 pl-2">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-xs mr-1">₹</Text>
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spend</Text>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-black text-lg">₹{Number(item.total_spend || 0).toFixed(2)}</Text>
                </View>
                <View className="w-1/2 pr-2">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-xs mr-1">📍</Text>
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Distance</Text>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-black text-lg">{Number(item.distance_km || 0).toFixed(1)} km</Text>
                </View>
                <View className="w-1/2 pl-2">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-xs mr-1">💰</Text>
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Budget Left</Text>
                  </View>
                  <Text className="text-amber-600 dark:text-amber-400 font-black text-lg">₹{Math.max(0, Number(item.budget || 0) - Number(item.total_spend || 0)).toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row justify-between pt-2">
              <TouchableOpacity 
                className="flex-1 bg-slate-900 dark:bg-white py-3.5 rounded-xl items-center shadow-sm"
                onPress={() => console.log('View stats for', item.id)}
              >
                <Text className="text-white dark:text-slate-900 font-black text-sm">View Stats</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] z-10">
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Ads</Text>
        <TouchableOpacity 
          className="bg-[#F59E0B] flex-row items-center px-4 py-2.5 rounded-full shadow-sm"
          onPress={() => navigation.navigate('CreateCampaign')}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text className="text-white font-bold ml-1.5 text-sm">Launch Your Ad</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
          ListEmptyComponent={
            <View className="items-center mt-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-8 shadow-sm">
              <View className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-6">
                <Megaphone size={32} className="text-amber-500" />
              </View>
              <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight mb-3 text-center">Start advertising on BRT screens 🚍</Text>
              <Text className="text-slate-500 dark:text-[#8B949E] text-center text-sm leading-relaxed mb-8">
                Choose where and when you want your advertisement displayed.
              </Text>
              <TouchableOpacity 
                className="bg-slate-900 dark:bg-white px-6 py-4 rounded-full shadow-md shadow-slate-900/20 flex-row items-center w-full justify-center"
                onPress={() => navigation.navigate('CreateCampaign')}
              >
                <Text className="text-white dark:text-slate-900 font-black text-sm">Launch Your First Ad</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
