import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Rocket
} from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

const { width } = Dimensions.get('window');

export default function AdsListScreen({ navigation }) {
  const { isDark } = useTheme();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

  const renderItem = ({ item }) => {
    const isVideo = item.media_type === 'video';
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
        {/* Creative Preview Hero */}
        <View style={{ backgroundColor: isDark ? '#090614' : '#F1F5F9' }} className="h-48 relative items-center justify-center">
          {mediaUri ? (
            <Image 
              source={{ uri: mediaUri }} 
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              {isVideo ? <Video size={48} color={isDark ? '#38BDF8' : '#0284C7'} /> : <ImageIcon size={48} color="#A855F7" />}
            </View>
          )}
        </View>

        {/* Ad Details Section */}
        <View className="p-5">
          {/* Title and Media Type Chip Row */}
          <View className="flex-row items-center justify-between mb-3.5">
            <Text 
              style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} 
              className="font-extrabold text-lg tracking-tight flex-1 mr-3" 
              numberOfLines={1}
            >
              {item.title}
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
                {isVideo ? `${item.play_duration || 15}s Video` : 'Static Image'}
              </Text>
            </View>
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
              onPress={() => navigation.navigate('CreateCampaign', { preselectedAdId: item.id, preselectedAdTitle: item.title })}
              className="flex-1 rounded-xl overflow-hidden shadow-md"
              style={{ shadowColor: '#9333EA', shadowRadius: 6 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-3 items-center justify-center flex-row"
              >
                <Rocket size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-white font-extrabold text-xs tracking-wide uppercase">Launch Campaign</Text>
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
        className="flex-row justify-between items-center px-5 py-4 border-b z-10"
      >
        <View>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight">
            Media Hub
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-0.5">
            Uploaded Creative Assets
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('UploadAd')}
          className="rounded-full overflow-hidden shadow-md"
          style={{ shadowColor: '#9333EA', shadowRadius: 8 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="flex-row items-center px-4 py-2.5 rounded-full"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
            <Text className="text-white font-extrabold ml-1.5 text-xs tracking-wide uppercase">Upload</Text>
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
                Your Media Library is Empty
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
    </SafeAreaView>
  );
}
