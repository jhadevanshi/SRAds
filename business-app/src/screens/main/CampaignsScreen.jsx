import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';
import AppLogo from '../../components/AppLogo';
import { 
  Plus, 
  Megaphone, 
  MapPin, 
  Play, 
  Pause, 
  Calendar, 
  TrendingUp, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BarChart2,
  Navigation,
  Video,
  Image as ImageIcon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

// Dedicated Video Preview for Campaign Card
const VideoCardPreview = memo(({ uri, isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={togglePlay}
      className="w-full h-full items-center justify-center relative overflow-hidden"
    >
      <VideoView 
        player={player} 
        style={{ width: '100%', height: '100%' }} 
        contentFit="contain" 
        nativeControls={false} 
      />
      {!isPlaying && (
        <View className="absolute inset-0 items-center justify-center bg-black/25">
          <View 
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.85)' }} 
            className="w-11 h-11 rounded-full items-center justify-center shadow-lg"
          >
            <Play size={20} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function CampaignsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, PENDING, COMPLETED

  const fetchCampaigns = useCallback(async () => {
    try {
      const [campRes, adsRes] = await Promise.all([
        businessService.getCampaigns().catch(e => ({ success: false, error: e })),
        businessService.getAds().catch(e => ({ success: false, error: e })),
      ]);

      if (campRes && campRes.success) {
        const rawCampaigns = campRes.campaigns || [];
        const adsList = (adsRes && adsRes.success && Array.isArray(adsRes.ads)) ? adsRes.ads : [];

        // Enrich campaigns with creative media metadata if missing
        const enriched = rawCampaigns.map(camp => {
          let matchedAd = null;
          
          // 1. Direct ad_id match if available
          if (camp.ad_id) {
            matchedAd = adsList.find(a => String(a.id) === String(camp.ad_id));
          }
          
          // 2. Match by campaign name and ad title
          if (!matchedAd && camp.campaign_name && adsList.length > 0) {
            const cleanCampName = camp.campaign_name.replace(/Transit Campaign/i, '').trim().toLowerCase();
            // Try exact title match after stripping "Transit Campaign"
            matchedAd = adsList.find(a => a.title && a.title.trim().toLowerCase() === cleanCampName);
            
            // Try prefix / contains match
            if (!matchedAd) {
              matchedAd = adsList.find(a => 
                a.title && (
                  camp.campaign_name.toLowerCase().includes(a.title.trim().toLowerCase()) ||
                  a.title.trim().toLowerCase().includes(cleanCampName)
                )
              );
            }
          }

          // 3. Fallback: if there's only 1 ad in the advertiser's media hub, match it
          if (!matchedAd && adsList.length === 1) {
            matchedAd = adsList[0];
          }

          const fileUrl = camp.file_url || matchedAd?.file_url || null;
          const isVideo = camp.media_type === 'video' || camp.type === 'video' || matchedAd?.media_type === 'video' || matchedAd?.type === 'video' || (fileUrl && fileUrl.toLowerCase().endsWith('.mp4'));
          const mediaType = isVideo ? 'video' : 'image';
          const playDuration = camp.play_duration || matchedAd?.play_duration || 15;
          const adTitle = camp.ad_title || matchedAd?.title || camp.campaign_name;

          return {
            ...camp,
            file_url: fileUrl,
            media_type: mediaType,
            type: mediaType,
            play_duration: playDuration,
            ad_title: adTitle,
          };
        });

        setCampaigns(enriched);
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
      fetchCampaigns();
    });
    const subCampaign = DeviceEventEmitter.addListener('CAMPAIGN_UPDATED', () => {
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
      return { text: 'Pending Approval', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
    }
    if (item.approval_status === 'Rejected' || (item.rejected_ad_count && parseInt(item.rejected_ad_count) > 0)) {
      return { text: 'Rejected', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
    }
    switch(item.status?.toLowerCase()) {
      case 'active': 
        return { text: 'Active & Broadcasting', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'scheduled': 
        return { text: 'Scheduled', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'paused': 
        return { text: 'Paused', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' };
      case 'completed': 
        return { text: 'Completed', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };
      default: 
        return { text: item.status || 'Active', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' };
    }
  };

  const filteredCampaigns = campaigns.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return item.status?.toLowerCase() === 'active' && item.approval_status !== 'Pending';
    if (filter === 'PENDING') return item.approval_status === 'Pending' || (item.pending_ad_count && parseInt(item.pending_ad_count) > 0);
    if (filter === 'COMPLETED') return item.status?.toLowerCase() === 'completed';
    return true;
  });

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const status = getCampaignStatus(item);
    const budget = Number(item.budget || 0);
    const spend = Number(item.total_spend || 0);
    const spendPercentage = budget > 0 ? Math.min(100, Math.round((spend / budget) * 100)) : 0;
    const isVideo = item.media_type === 'video' || item.type === 'video' || (item.file_url && item.file_url.toLowerCase().endsWith('.mp4'));
    const mediaUri = item.file_url ? (item.file_url.startsWith('http') ? item.file_url : `${getBaseUrl().replace('/api', '')}${item.file_url.startsWith('/') ? '' : '/'}${item.file_url}`) : null;

    return (
      <View 
        style={{
          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
          borderColor: isDark ? (isExpanded ? '#7C3AED' : '#281B4B') : (isExpanded ? '#C084FC' : '#EDE9FE'),
          shadowColor: isDark ? '#7C3AED' : '#9333EA',
          shadowOffset: { width: 0, height: isExpanded ? 6 : 2 },
          shadowOpacity: isDark ? (isExpanded ? 0.25 : 0.1) : 0.08,
          shadowRadius: isExpanded ? 12 : 6,
          elevation: isExpanded ? 6 : 2,
        }}
        className="border rounded-3xl mb-5 overflow-hidden"
      >
        {/* Creative Preview Hero - Exact Match with Media Hub */}
        <View style={{ backgroundColor: isDark ? '#090614' : '#F1F5F9' }} className="h-48 relative items-center justify-center">
          {mediaUri ? (
            isVideo ? (
              <VideoCardPreview uri={mediaUri} isDark={isDark} />
            ) : (
              <Image 
                source={{ uri: mediaUri }} 
                className="w-full h-full"
                resizeMode="contain"
              />
            )
          ) : (
            <View className="w-full h-full items-center justify-center">
              {isVideo ? <Video size={48} color={isDark ? '#38BDF8' : '#0284C7'} /> : <ImageIcon size={48} color="#A855F7" />}
            </View>
          )}
        </View>

        {/* Card Header & Controls (Always Visible) */}
        <TouchableOpacity 
          onPress={() => toggleExpand(item.id)}
          className="p-5"
          activeOpacity={0.7}
        >
          {/* Title and Media Type Chip Row */}
          <View className="flex-row items-center justify-between mb-3">
            <Text 
              style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} 
              className="font-extrabold text-lg tracking-tight flex-1 mr-3" 
              numberOfLines={1}
            >
              {item.campaign_name}
            </Text>

            <View 
              style={{ 
                backgroundColor: isDark ? (isVideo ? 'rgba(56, 189, 248, 0.12)' : 'rgba(192, 132, 252, 0.12)') : (isVideo ? '#E0F2FE' : '#F3E8FF'),
                borderColor: isDark ? (isVideo ? 'rgba(56, 189, 248, 0.3)' : 'rgba(192, 132, 252, 0.3)') : (isVideo ? '#BAE6FD' : '#E9D5FF')
              }}
              className="border px-2.5 py-1 rounded-full flex-row items-center shrink-0"
            >
              {isVideo ? (
                <Video size={11} color={isDark ? '#38BDF8' : '#0284C7'} />
              ) : (
                <ImageIcon size={11} color={isDark ? '#C084FC' : '#7C3AED'} />
              )}
              <Text 
                style={{ color: isDark ? (isVideo ? '#38BDF8' : '#C084FC') : (isVideo ? '#0284C7' : '#7C3AED') }} 
                className="text-[10px] font-bold ml-1.5 uppercase tracking-wider"
              >
                {isVideo ? 'Video' : 'Static Image'}
              </Text>
            </View>
          </View>

          {/* Status Badge & Expand Toggle Row */}
          <View className="flex-row items-center justify-between mb-3.5">
            <View 
              style={{ backgroundColor: status.bg, borderColor: status.border }}
              className="self-start px-3 py-1 rounded-full border flex-row items-center"
            >
              <View style={{ backgroundColor: status.color }} className="w-1.5 h-1.5 rounded-full mr-2" />
              <Text style={{ color: status.color }} className="text-xs font-bold">
                {status.text}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mr-1.5">
                {isExpanded ? 'Hide Details' : 'View Details'}
              </Text>
              {isExpanded ? (
                <View style={{ backgroundColor: isDark ? '#201642' : '#F3F0FF' }} className="p-1 rounded-full">
                  <ChevronUp size={16} color={isDark ? '#C084FC' : '#7C3AED'} />
                </View>
              ) : (
                <View style={{ backgroundColor: isDark ? '#181033' : '#F8F7FF' }} className="p-1 rounded-full">
                  <ChevronDown size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
              )}
            </View>
          </View>

          {/* Quick Metrics Bar in Collapsed Mode */}
          <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderColor: isDark ? '#281B4B' : '#F1F5F9' }}>
            <View className="flex-row items-center">
              <MapPin size={13} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold ml-1.5" numberOfLines={1}>
                {item.area || 'Citywide Fleet'}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs mr-1 font-medium">Plays:</Text>
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">
                {Number(item.total_plays || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs mr-1 font-medium">Spend:</Text>
              <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="text-xs font-black">
                ₹{spend.toFixed(0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View 
            style={{ 
              backgroundColor: isDark ? '#0D091A' : '#FAFAFF',
              borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="px-5 pb-5 pt-3 border-t"
          >
            {/* Status alerts */}
            {(item.approval_status === 'Pending' || (item.pending_ad_count && parseInt(item.pending_ad_count) > 0)) && (
              <View 
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)' }}
                className="p-4 rounded-2xl flex-row items-start border mb-4"
              >
                <Clock size={18} color="#F59E0B" style={{ marginTop: 2, marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-amber-500 font-bold text-xs uppercase tracking-wider">Awaiting Verification</Text>
                  <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs mt-1 leading-relaxed">
                    Creative is under automatic QA review for high-resolution transit display safety.
                  </Text>
                </View>
              </View>
            )}

            {(item.approval_status === 'Rejected' || (item.rejected_ad_count && parseInt(item.rejected_ad_count) > 0)) && (
              <View 
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)' }}
                className="p-4 rounded-2xl flex-row items-start border mb-4"
              >
                <AlertCircle size={18} color="#EF4444" style={{ marginTop: 2, marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-red-500 font-bold text-xs uppercase tracking-wider">Action Required</Text>
                  <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs mt-1 leading-relaxed">
                    {item.rejection_reason || item.ad_rejection_reasons || 'Creative does not meet transit display resolution specifications.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Schedule & Target Grid */}
            <View className="flex-row justify-between mb-4">
              <View 
                style={{ backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? '#281B4B' : '#E2E8F0' }}
                className="flex-1 mr-2 p-3 rounded-2xl border"
              >
                <View className="flex-row items-center mb-1">
                  <MapPin size={13} color="#A855F7" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Location</Text>
                </View>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs" numberOfLines={1}>
                  {item.area || 'All Corridors'}
                </Text>
              </View>

              <View 
                style={{ backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? '#281B4B' : '#E2E8F0' }}
                className="flex-1 ml-2 p-3 rounded-2xl border"
              >
                <View className="flex-row items-center mb-1">
                  <Calendar size={13} color="#A855F7" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Flight Dates</Text>
                </View>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs">
                  {item.start_date ? new Date(item.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Live'} - {item.end_date ? new Date(item.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Ongoing'}
                </Text>
              </View>
            </View>

            {/* Budget & Consumption Progress */}
            <View 
              style={{ backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? '#281B4B' : '#E2E8F0' }}
              className="p-4 rounded-2xl border mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-bold">Budget Consumption</Text>
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">{spendPercentage}%</Text>
              </View>
              
              {/* Progress Bar */}
              <View style={{ backgroundColor: isDark ? '#201642' : '#F1F5F9' }} className="h-2 rounded-full overflow-hidden mb-3">
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${Math.max(4, spendPercentage)}%`, height: '100%' }}
                  className="rounded-full"
                />
              </View>

              <View className="flex-row justify-between">
                <View>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-medium uppercase">Spent</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">₹{spend.toFixed(2)}</Text>
                </View>
                <View className="items-end">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-medium uppercase">Total Budget</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">₹{budget.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* 4-Stat Performance Matrix */}
            <View 
              style={{ backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? '#281B4B' : '#E2E8F0' }}
              className="p-4 rounded-2xl border mb-4"
            >
              <View className="flex-row flex-wrap justify-between">
                <View className="w-1/2 mb-3 pr-2">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Plays</Text>
                  <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-black text-base">
                    {Number(item.total_plays || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="w-1/2 mb-3 pl-2">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Fleet Coverage</Text>
                  <Text style={{ color: isDark ? '#38BDF8' : '#0284C7' }} className="font-black text-base">
                    {Number(item.distance_km || 0).toFixed(1)} km
                  </Text>
                </View>

                <View className="w-1/2 pr-2">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Est. Impressions</Text>
                  <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="font-black text-base">
                    {(Number(item.total_plays || 0) * 14).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="w-1/2 pl-2">
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Remaining</Text>
                  <Text style={{ color: isDark ? '#F59E0B' : '#D97706' }} className="font-black text-base">
                    ₹{Math.max(0, budget - spend).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Bar */}
            <View className="flex-row gap-3 pt-1">
              <TouchableOpacity 
                onPress={() => navigation.navigate('Analytics', { campaignId: item.id })}
                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }}
              >
                <BarChart2 size={16} color={isDark ? '#C084FC' : '#7C3AED'} />
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-bold text-xs ml-2">Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate('LiveFleet')}
                className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
                style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }}
              >
                <Navigation size={16} color={isDark ? '#38BDF8' : '#0284C7'} />
                <Text style={{ color: isDark ? '#38BDF8' : '#0284C7' }} className="font-bold text-xs ml-2">Live Map</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </View>
    );
  };

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
        className="flex-row justify-between items-center px-4 py-3.5 border-b z-10"
      >
        <View className="flex-row items-center flex-1 mr-2.5">
          <AppLogo size={36} isDark={isDark} style={{ marginRight: 10 }} />
          <View className="flex-1">
            <Text 
              style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} 
              className="text-xl font-black tracking-tight"
              numberOfLines={1}
            >
              Campaigns
            </Text>
            <Text 
              style={{ color: isDark ? '#94A3B8' : '#64748B' }} 
              className="text-[11px] font-semibold"
              numberOfLines={1}
            >
              Real-Time Transit Broadcasts
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateCampaign')}
          activeOpacity={0.8}
          className="rounded-full overflow-hidden shadow-md shrink-0"
          style={{ shadowColor: '#9333EA', shadowRadius: 8, shadowOpacity: 0.3 }}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center px-3.5 py-2 rounded-full"
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={3} />
            <Text className="text-white font-extrabold ml-1.5 text-[11px] tracking-wide uppercase">New Campaign</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="px-5 py-3 flex-row gap-2">
        {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((tab) => {
          const isSelected = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              style={{
                backgroundColor: isSelected 
                  ? (isDark ? '#7C3AED' : '#7C3AED')
                  : (isDark ? '#181033' : '#FFFFFF'),
                borderColor: isSelected 
                  ? '#9333EA' 
                  : (isDark ? '#281B4B' : '#EDE9FE'),
              }}
              className="px-3.5 py-1.5 rounded-full border"
            >
              <Text 
                style={{
                  color: isSelected ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                  fontWeight: isSelected ? '800' : '600',
                }}
                className="text-xs"
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-3">Loading active broadcasts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCampaigns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
          ListEmptyComponent={
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="items-center mt-6 border rounded-3xl p-8 shadow-sm"
            >
              <LinearGradient
                colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
                className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
              >
                <Megaphone size={34} color={isDark ? '#FFFFFF' : '#7C3AED'} />
              </LinearGradient>
              
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-extrabold tracking-tight mb-2 text-center">
                {filter === 'ALL' ? 'Start Your Transit Ad Campaign 🚍' : `No ${filter.toLowerCase()} campaigns`}
              </Text>
              
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm leading-relaxed mb-6 px-4">
                Reach thousands of commuters daily across high-traffic city transit networks with geofenced digital screens.
              </Text>

              <TouchableOpacity 
                onPress={() => navigation.navigate('CreateCampaign')}
                className="rounded-2xl overflow-hidden w-full shadow-lg"
                style={{ shadowColor: '#9333EA', shadowRadius: 10, shadowOpacity: 0.35 }}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 items-center justify-center flex-row"
                >
                  <Sparkles size={18} color="#FFFFFF" className="mr-2" />
                  <Text className="text-white font-black text-sm tracking-wide">Launch Your First Ad</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
