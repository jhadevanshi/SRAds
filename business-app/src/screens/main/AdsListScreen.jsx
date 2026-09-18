import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Video, Image as ImageIcon, Trash2, Pause, Play, CheckCircle2, Clock, XCircle, Info } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function AdsListScreen({ navigation }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const fetchAds = useCallback(async () => {
    try {
      const res = await businessService.getAds();
      if (res.success) {
        setAds(res.ads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAds();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAds();
    const interval = setInterval(() => {
      if (!loading && !refreshing) fetchAds();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchAds, loading, refreshing]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      console.log('[AdsListScreen] Real-time ad playback completed. Refreshing...');
      fetchAds();
    });
    return () => subPlayback.remove();
  }, [fetchAds]);

  const handleDelete = (id) => {
    Alert.alert('Delete Advertisement', 'Are you sure you want to permanently delete this creative?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await businessService.deleteAd(id);
          if (res.success) {
            setAds(ads.filter(a => a.id !== id));
          } else {
            Alert.alert('Unable to Delete', res.message);
          }
        } catch (err) {
          Alert.alert('Error', err.response?.data?.message || 'Failed to delete advertisement.');
        }
      }}
    ]);
  };

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'http://192.168.147.25:5000';

  const getStatusInfo = (status, approvalStatus) => {
    if (approvalStatus === 'Pending') return { text: 'Pending Admin Approval', color: 'amber', icon: Clock };
    if (approvalStatus === 'Rejected') return { text: 'Rejected', color: 'red', icon: XCircle };
    if (status === 'Active') return { text: 'Active', color: 'emerald', icon: CheckCircle2 };
    return { text: 'Paused', color: 'slate', icon: Pause };
  };

  const toggleTooltip = (id) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const renderItem = ({ item }) => {
    const isVideo = item.media_type === 'video';
    const statusInfo = getStatusInfo(item.status, item.approval_status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl mb-5 shadow-sm overflow-hidden">
        
        {/* Ad Preview Section */}
        <View className="h-48 bg-slate-100 dark:bg-[#0D1117] relative">
          {item.file_url ? (
            <Image 
              source={{ uri: item.file_url.startsWith('http') ? item.file_url : `${getBaseUrl().replace('/api', '')}${item.file_url.startsWith('/') ? '' : '/'}${item.file_url}` }} 
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              {isVideo ? <Video size={48} className="text-slate-300 dark:text-slate-700" /> : <ImageIcon size={48} className="text-slate-300 dark:text-slate-700" />}
            </View>
          )}
          <View className="absolute inset-0 bg-black/10" />
          
          <View className={`absolute top-3 left-3 flex-row items-center bg-${statusInfo.color}-500/90 px-3 py-1.5 rounded-full shadow-md`}>
            <StatusIcon size={12} color="#FFF" />
            <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-1.5">
              {statusInfo.text}
            </Text>
          </View>

          <View className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 rounded-md flex-row items-center">
            {isVideo ? <Video size={12} color="#FFF" /> : <ImageIcon size={12} color="#FFF" />}
            <Text className="text-white text-[10px] font-bold ml-1.5 uppercase tracking-wider">{isVideo ? 'Video Ad' : 'Image Ad'}</Text>
          </View>
        </View>

        {/* Ad Details Section */}
        <View className="p-5">
          <Text className="text-slate-900 dark:text-white font-black text-xl tracking-tight mb-4" numberOfLines={1}>{item.title}</Text>
          
          {item.approval_status === 'Pending' && (
            <View className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
              <Text className="text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-0.5">Pending Admin Approval</Text>
              <Text className="text-amber-600 dark:text-amber-400 text-xs font-medium">Your ad has been submitted and is waiting for review.</Text>
            </View>
          )}

          {item.approval_status === 'Rejected' && (
            <View className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
              <Text className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-0.5">Rejected</Text>
              <Text className="text-red-500 dark:text-red-300 text-xs font-medium">
                Reason: {item.rejection_reason || 'No reason provided by the administrator.'}
              </Text>
            </View>
          )}
          
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

          {/* Quick Actions */}
          <View className="flex-row justify-between pt-1">
            <TouchableOpacity 
              onPress={() => handleDelete(item.id)}
              className="bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl flex-row items-center"
            >
              <Trash2 size={16} className="text-red-500" />
              <Text className="text-red-600 dark:text-red-400 font-bold text-sm ml-2">Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateCampaign', { preselectedAdId: item.id, preselectedAdTitle: item.title })}
              className="bg-slate-100 dark:bg-[#30363D] px-6 py-2.5 rounded-xl flex-row items-center"
            >
              <Text className="text-slate-700 dark:text-white font-bold text-sm">Use This Ad</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#0D1117] z-10">
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Ads</Text>
        <TouchableOpacity 
          className="bg-[#F59E0B] flex-row items-center px-4 py-2.5 rounded-full shadow-sm"
          onPress={() => navigation.navigate('UploadAd')}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text className="text-white font-bold ml-1.5 text-sm">Upload</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
          ListEmptyComponent={
            <View className="items-center mt-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-8 shadow-sm">
              <View className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-6">
                <ImageIcon size={32} className="text-amber-500" />
              </View>
              <Text className="text-slate-900 dark:text-white text-xl font-black tracking-tight mb-3 text-center">No Advertisements Yet</Text>
              <Text className="text-slate-500 dark:text-[#8B949E] text-center text-sm leading-relaxed mb-8">
                Upload your first image or video ad. It will be saved here so you can easily use it across multiple campaigns.
              </Text>
              <TouchableOpacity 
                className="bg-slate-900 dark:bg-white px-6 py-4 rounded-full shadow-md shadow-slate-900/20 flex-row items-center w-full justify-center"
                onPress={() => navigation.navigate('UploadAd')}
              >
                <Plus size={18} className="text-white dark:text-slate-900" strokeWidth={3} />
                <Text className="text-white dark:text-slate-900 font-black text-sm ml-2">Upload First Ad</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
