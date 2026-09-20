import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Rocket,
  Play, 
  Maximize2,
  Scissors,
  Clock
} from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import AppLogo from '../../components/AppLogo';
import VideoTrimmer from '../../components/VideoTrimmer';
import FullscreenMediaViewer from '../../components/FullscreenMediaViewer';

const { width } = Dimensions.get('window');

// Dedicated Video Preview for Media Card with Tap to Fullscreen
const VideoCardPreview = memo(({ uri, isDark, onFullScreen }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  const togglePlay = (e) => {
    e?.stopPropagation?.();
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
    <View className="w-full h-full items-center justify-center relative overflow-hidden">
      <VideoView 
        player={player} 
        style={{ width: '100%', height: '100%' }} 
        contentFit="contain" 
        nativeControls={false} 
      />
      
      {/* Play/Pause Center Tap Button */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={togglePlay}
        className="absolute inset-0 items-center justify-center bg-black/15"
      >
        {!isPlaying && (
          <View 
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.85)' }} 
            className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
          >
            <Play size={22} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

export default function AdsListScreen({ navigation }) {
  const { isDark } = useTheme();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [trimModal, setTrimModal] = useState({ visible: false, ad: null });

  const fetchAds = useCallback(async () => {
    try {
      const res = await businessService.getAds();
      if (res.success) {
        setAds(res.ads || []);
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
      fetchAds();
    });
    return () => subPlayback.remove();
  }, [fetchAds]);

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Creative', 
      `Are you sure you want to permanently delete "${title}"?`, 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
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
          }
        }
      ]
    );
  };

  const handleSaveTrim = async (trimData) => {
    try {
      if (!trimModal.ad) return;
      const res = await businessService.trimAdVideo(trimModal.ad.id, trimData);
      if (res.success) {
        Alert.alert('Trim Saved 🎉', 'Video commercial duration updated successfully!');
        setTrimModal({ visible: false, ad: null });
        fetchAds();
      } else {
        Alert.alert('Trim Failed', res.message || 'Unable to save video trim.');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to update video trim.');
    }
  };

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

  const renderItem = ({ item }) => {
    const isVideo = item.media_type === 'video' || item.type === 'video' || (item.file_url && item.file_url.toLowerCase().endsWith('.mp4'));
    const mediaUri = item.file_url ? (item.file_url.startsWith('http') ? item.file_url : `${getBaseUrl().replace('/api', '')}${item.file_url.startsWith('/') ? '' : '/'}${item.file_url}`) : null;
    
    return (
      <View 
        style={{
          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
          borderColor: isDark ? '#281B4B' : '#EDE9FE',
          shadowColor: isDark ? '#7C3AED' : '#9333EA',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.2 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
        className="border rounded-3xl mb-5 overflow-hidden"
      >
        {/* Creative Preview Hero with Full Mode Tap */}
        <View style={{ backgroundColor: isDark ? '#090614' : '#F1F5F9' }} className="h-48 relative items-center justify-center">
          {mediaUri ? (
            isVideo ? (
              <VideoCardPreview 
                uri={mediaUri} 
                isDark={isDark} 
                onFullScreen={() => setFullscreenMedia({
                  ...item,
                  canTrim: true
                })} 
              />
            ) : (
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => setFullscreenMedia({
                  ...item,
                  canTrim: false
                })}
                className="w-full h-full"
              >
                <Image 
                  source={{ uri: mediaUri }} 
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )
          ) : (
            <View className="w-full h-full items-center justify-center">
              {isVideo ? <Video size={48} color={isDark ? '#38BDF8' : '#0284C7'} /> : <ImageIcon size={48} color="#A855F7" />}
            </View>
          )}

          {/* Full View Tap Overlay Chip */}
          <TouchableOpacity
            onPress={() => setFullscreenMedia({
              ...item,
              canTrim: isVideo
            })}
            activeOpacity={0.8}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 flex-row items-center"
          >
            <Maximize2 size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text className="text-white text-[10px] font-extrabold uppercase tracking-wider">Full View</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Details Section */}
        <View className="p-5">
          {/* Title and Media Type Chip Row (Without Truncation, Multi-Line Vertically) */}
          <View className="flex-row items-start justify-between mb-2">
            <Text 
              style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} 
              className="font-black text-lg tracking-tight flex-1 mr-3 leading-snug" 
            >
              {item.title}
            </Text>

            <View 
              style={{ 
                backgroundColor: isDark ? (isVideo ? 'rgba(56, 189, 248, 0.12)' : 'rgba(192, 132, 252, 0.12)') : (isVideo ? '#E0F2FE' : '#F3E8FF'),
                borderColor: isDark ? (isVideo ? 'rgba(56, 189, 248, 0.3)' : 'rgba(192, 132, 252, 0.3)') : (isVideo ? '#BAE6FD' : '#E9D5FF')
              }}
              className="border px-2.5 py-1 rounded-full flex-row items-center shrink-0 mt-0.5"
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

          {/* Duration & Trim Info Row */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center">
              <Clock size={12} color={isDark ? '#94A3B8' : '#64748B'} style={{ marginRight: 4 }} />
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-bold">
                {parseInt(item.play_duration || 20)}s commercial
              </Text>
            </View>

            {isVideo && item.video_trim_end && parseInt(item.video_trim_end) > 0 && (
              <View 
                style={{ backgroundColor: isDark ? '#181033' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }} 
                className="px-2.5 py-0.5 rounded-lg border flex-row items-center"
              >
                <Scissors size={10} color={isDark ? '#C084FC' : '#7C3AED'} style={{ marginRight: 4 }} />
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-bold">
                  {parseInt(item.video_trim_start || 0)}s–{parseInt(item.video_trim_end)}s
                </Text>
              </View>
            )}
          </View>
          
          {/* Performance Matrix */}
          <View 
            style={{ 
              backgroundColor: isDark ? '#0D091A' : '#FAFAFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="rounded-2xl p-3.5 mb-4 border"
          >
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Plays</Text>
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-base">
                  {Number(item.total_plays || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Spend</Text>
                <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="font-extrabold text-base">
                  ₹{Number(item.total_spend || 0).toFixed(2)}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Coverage</Text>
                <Text style={{ color: isDark ? '#38BDF8' : '#0284C7' }} className="font-extrabold text-base">
                  {Number(item.distance_km || 0).toFixed(1)} km
                </Text>
              </View>
            </View>
          </View>

          {/* Media Actions: View Full Mode & Adjust Trim */}
          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => setFullscreenMedia({
                ...item,
                canTrim: isVideo
              })}
              style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE', borderColor: isDark ? '#3B2A68' : '#DDD6FE' }}
              className="flex-1 py-2.5 px-3 rounded-xl border flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Maximize2 size={13} color={isDark ? '#C084FC' : '#7C3AED'} />
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-xs ml-1.5">
                View Full Mode {isVideo ? '(Audio)' : ''}
              </Text>
            </TouchableOpacity>

            {isVideo && (
              <TouchableOpacity
                onPress={() => setTrimModal({
                  visible: true,
                  ad: item,
                })}
                style={{ backgroundColor: isDark ? 'rgba(124, 58, 237, 0.18)' : '#F3E8FF', borderColor: isDark ? '#7C3AED' : '#C084FC' }}
                className="py-2.5 px-3.5 rounded-xl border flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Scissors size={13} color={isDark ? '#C084FC' : '#7C3AED'} />
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-xs ml-1.5 uppercase tracking-wider">
                  Adjust Trim
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              onPress={() => handleDelete(item.id, item.title)}
              style={{ backgroundColor: isDark ? '#2B1218' : '#FFF1F2' }}
              className="p-3 rounded-xl items-center justify-center"
            >
              <Trash2 size={16} color="#F43F5E" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateCampaign', { 
                preselectedAdId: item.id, 
                preselectedAdTitle: item.title,
                preselectedMediaType: item.media_type || item.type,
                preselectedMediaUri: item.file_url,
                preselectedPlayDuration: item.play_duration
              })}
              className="flex-1 rounded-xl overflow-hidden shadow-md"
              style={{ shadowColor: '#9333EA', shadowRadius: 6 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%',
                  height: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Rocket size={15} color="#FFFFFF" />
                <Text 
                  style={{ 
                    color: '#FFFFFF', 
                    fontWeight: '800', 
                    fontSize: 12, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5, 
                    textAlign: 'center',
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  }}
                >
                  Launch Campaign
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} 
      className="flex-1" 
      edges={['top']}
    >
      {/* Header */}
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
              Media Hub
            </Text>
            <Text 
              style={{ color: isDark ? '#94A3B8' : '#64748B' }} 
              className="text-[11px] font-semibold"
              numberOfLines={1}
            >
              Uploaded Creative Assets
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('UploadAd')}
          className="rounded-full overflow-hidden shadow-md shrink-0"
          style={{ shadowColor: '#9333EA', shadowRadius: 8, shadowOpacity: 0.3 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="flex-row items-center px-3.5 py-2 rounded-full"
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={3} />
            <Text className="text-white font-extrabold ml-1.5 text-[11px] tracking-wide uppercase">Upload</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-3">Loading creatives...</Text>
        </View>
      ) : (
        <FlatList
          data={ads}
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
                <ImageIcon size={34} color={isDark ? '#FFFFFF' : '#7C3AED'} />
              </LinearGradient>

              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-extrabold tracking-tight mb-2 text-center">
                Your media library is empty
              </Text>
              
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm leading-relaxed mb-6 px-4">
                Upload your business video commercials or high-definition promotional posters to start advertising.
              </Text>

              <TouchableOpacity 
                onPress={() => navigation.navigate('UploadAd')}
                className="rounded-2xl overflow-hidden w-full shadow-lg"
                style={{ shadowColor: '#9333EA', shadowRadius: 10, shadowOpacity: 0.35 }}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 items-center justify-center flex-row"
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={3} className="mr-2" />
                  <Text className="text-white font-black text-sm tracking-wide">Upload First Creative</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Fullscreen Media Viewer Modal with Audio (Trim in Top Left, Audio in Top Centre, Close in Top Right, Play/Pause in Bottom Centre) */}
      <FullscreenMediaViewer 
        visible={!!fullscreenMedia}
        media={fullscreenMedia}
        onClose={() => setFullscreenMedia(null)}
        onTrimPress={(media) => {
          setTrimModal({
            visible: true,
            ad: media,
          });
        }}
      />

      {/* Video Trimmer Modal for Media Hub Creatives */}
      <Modal 
        visible={trimModal.visible} 
        animationType="slide" 
        onRequestClose={() => setTrimModal({ visible: false, ad: null })}
      >
        {trimModal.ad && (
          <VideoTrimmer 
            uri={trimModal.ad.file_url ? (trimModal.ad.file_url.startsWith('http') ? trimModal.ad.file_url : `${getBaseUrl().replace('/api', '')}${trimModal.ad.file_url.startsWith('/') ? '' : '/'}${trimModal.ad.file_url}`) : ''}
            originalDurationSec={trimModal.ad.original_duration || trimModal.ad.duration || trimModal.ad.play_duration || 20}
            onSave={handleSaveTrim}
            onCancel={() => setTrimModal({ visible: false, ad: null })}
          />
        )}
      </Modal>

    </SafeAreaView>
  );
}
