import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { businessService } from '../../services/business';
import { 
  ArrowLeft, 
  UploadCloud, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  Megaphone, 
  Trash2,
  Sparkles,
  Scissors
} from 'lucide-react-native';
import VideoTrimmer from '../../components/VideoTrimmer';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function UploadAdScreen({ navigation }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({ title: '' });
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedAd, setUploadedAd] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimData, setTrimData] = useState(null);

  const pickMedia = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      
      if (asset.type === 'video') {
        const rawDur = asset.duration || 0;
        const durationSec = rawDur > 1000 ? rawDur / 1000 : (rawDur > 0 ? rawDur : 0);
        
        if (durationSec > 0 && durationSec < 30) {
          Alert.alert(
            'Video Too Short',
            `Transit campaign videos must be at least 30 seconds long. The selected video is only ${durationSec.toFixed(1)} seconds. Please choose a video of 30 seconds or longer.`
          );
          return;
        }

        const validDur = durationSec > 0 ? durationSec : 30;
        setMedia({ ...asset, calculatedDuration: validDur });
        setTrimData({ start: 0, end: Math.max(30, validDur), duration: Math.max(30, validDur) });
        setShowTrimmer(true);
      } else {
        setMedia(asset);
        setTrimData(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!form.title || !media) {
      Alert.alert('Incomplete', 'Please provide a title and select a media file.');
      return;
    }

    if (media.type === 'video') {
      const playDur = trimData ? (trimData.end - trimData.start) : (media.calculatedDuration || 30);
      if (playDur < 29.9) {
        Alert.alert('Invalid Duration', 'Transit campaign videos must be at least 30 seconds long.');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('budget', '0'); 
      formData.append('cost_per_play', media.type === 'video' ? '2' : '1');
      
      if (trimData && media.type === 'video') {
        formData.append('video_trim_start', String(Math.floor(trimData.start)));
        formData.append('video_trim_end', String(Math.ceil(trimData.end)));
        formData.append('play_duration', String(Math.ceil(trimData.end - trimData.start)));
      } else if (media.type === 'image') {
        formData.append('play_duration', '30');
      }

      formData.append('media', {
        uri: media.uri,
        name: media.fileName || `upload.${media.uri.split('.').pop()}`,
        type: media.mimeType || (media.type === 'video' ? 'video/mp4' : 'image/jpeg')
      });

      const res = await businessService.uploadAd(formData);
      if (res.success) {
        const adDuration = media.type === 'image' ? 30 : (parseInt(trimData.end) - parseInt(trimData.start) || 30);
        setUploadedAd({
          id: res.ad?.id || null,
          title: form.title,
          type: media.type,
          uri: res.media?.file_url || res.ad?.file_url || media.uri,
          play_duration: res.ad?.play_duration || adDuration
        });
        setShowSuccess(true);
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showTrimmer && media?.type === 'video') {
    return (
      <VideoTrimmer 
        uri={media.uri}
        originalDurationSec={media.calculatedDuration || (media.duration ? (media.duration > 1000 ? media.duration / 1000 : media.duration) : 30)}
        onSave={(data) => {
          setTrimData(data);
          setShowTrimmer(false);
        }}
        onCancel={() => {
          setShowTrimmer(false);
        }}
      />
    );
  }

  if (showSuccess) {
    return (
      <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1">
        <View className="flex-1 items-center justify-center p-6">
          
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-lg"
            style={{ shadowColor: '#9333EA', shadowRadius: 15, shadowOpacity: 0.4 }}
          >
            <CheckCircle2 size={48} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight text-center mb-2">
            Saved to Media Hub!
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm font-medium mb-8 px-4 leading-relaxed">
            "{uploadedAd?.title}" is safely stored in your library and ready to launch in a campaign whenever you're ready.
          </Text>

          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="w-full border rounded-3xl p-5 mb-8 shadow-sm"
          >
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base text-center mb-4">
              Next Steps
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                setShowSuccess(false);
                navigation.replace('CreateCampaign', { 
                  preselectedAdId: uploadedAd?.id, 
                  preselectedAdTitle: uploadedAd?.title,
                  preselectedMediaType: uploadedAd?.type,
                  preselectedMediaUri: uploadedAd?.uri,
                  preselectedPlayDuration: uploadedAd?.play_duration
                });
              }}
              className="rounded-2xl overflow-hidden shadow-lg mb-3 w-full"
              style={{ shadowColor: '#9333EA', shadowRadius: 10, shadowOpacity: 0.35 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%',
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Megaphone size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' }}>
                  Launch Campaign Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
              style={{ 
                backgroundColor: isDark ? '#181033' : '#F8F7FF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE',
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}
              className="rounded-2xl border"
              activeOpacity={0.8}
            >
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569', textAlign: 'center' }} className="font-bold text-xs uppercase tracking-wider">
                Back to Media Hub
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      {/* Top Header */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="flex-row items-center px-5 py-4 border-b z-10"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            backgroundColor: isDark ? '#1F1735' : '#F8F7FF',
            borderColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="p-2.5 rounded-full border mr-3"
        >
          <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#1E1B4B'} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">
            Upload Creative
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">
            Add Assets for Transit Network
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-10">
        
        {/* Step 1: Media Format Selection */}
        <View className="mb-6">
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-base mb-3">
            1. Select Format & Media
          </Text>
          
          {!media ? (
            <View className="flex-row gap-3">
              <TouchableOpacity 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="flex-1 border rounded-3xl p-5 items-center justify-center shadow-sm"
                onPress={() => pickMedia('image')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
                  style={{ width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                >
                  <ImageIcon size={26} color={isDark ? '#FFFFFF' : '#7C3AED'} />
                </LinearGradient>
                <Text 
                  style={{ 
                    color: isDark ? '#F8FAFC' : '#1E1B4B',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: 14,
                    marginBottom: 4,
                    includeFontPadding: false,
                  }}
                >
                  Image Asset
                </Text>
                <Text 
                  style={{ 
                    color: isDark ? '#94A3B8' : '#64748B',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    includeFontPadding: false,
                  }}
                >
                  JPG, PNG up to 10MB
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="flex-1 border rounded-3xl p-5 items-center justify-center shadow-sm"
                onPress={() => pickMedia('video')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#38BDF8', '#0284C7'] : ['#E0F2FE', '#BAE6FD']}
                  style={{ width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}
                >
                  <Video size={26} color={isDark ? '#FFFFFF' : '#0284C7'} />
                </LinearGradient>
                <Text 
                  style={{ 
                    color: isDark ? '#F8FAFC' : '#1E1B4B',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: 14,
                    marginBottom: 4,
                    includeFontPadding: false,
                  }}
                >
                  Video Commercial
                </Text>
                <Text 
                  style={{ 
                    color: isDark ? '#94A3B8' : '#64748B',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    includeFontPadding: false,
                  }}
                >
                  MP4 with Trimmer
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#7C3AED' : '#C084FC' 
              }}
              className="border-2 rounded-3xl overflow-hidden shadow-sm"
            >
              {media.type === 'video' ? (
                <View style={{ backgroundColor: isDark ? '#0F0A21' : '#F5F3FF' }} className="py-7 px-5 justify-center items-center">
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA']}
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-md"
                  >
                    <Video size={30} color="#FFFFFF" />
                  </LinearGradient>
                  
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-base text-center mb-1" numberOfLines={1}>
                    {media.fileName || 'Video Commercial.mp4'}
                  </Text>
                  
                  {trimData ? (
                    <View 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.14)' : '#EDE9FE', 
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : '#DDD6FE' 
                      }} 
                      className="border px-4 py-2 rounded-2xl items-center justify-center my-3 self-center"
                    >
                      <View className="flex-row items-center justify-center">
                        <Scissors size={12} color={isDark ? '#C084FC' : '#7C3AED'} style={{ marginRight: 6 }} />
                        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-black">
                          {trimData.start.toFixed(1)}s – {trimData.end.toFixed(1)}s
                        </Text>
                        <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-bold ml-2">
                          ({trimData.duration.toFixed(1)}s duration)
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.14)' : '#EDE9FE', 
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : '#DDD6FE' 
                      }} 
                      className="border px-4 py-2 rounded-2xl items-center justify-center my-3 self-center"
                    >
                      <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">
                        Full Duration: {(media.calculatedDuration || 30).toFixed(1)}s
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    onPress={() => setShowTrimmer(true)}
                    style={{ backgroundColor: isDark ? '#201642' : '#EDE9FE', borderColor: isDark ? '#3B2A68' : '#DDD6FE' }}
                    className="px-5 py-2.5 rounded-xl border flex-row items-center justify-center shadow-sm"
                    activeOpacity={0.8}
                  >
                    <Scissors size={13} color={isDark ? '#C084FC' : '#7C3AED'} style={{ marginRight: 6 }} />
                    <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-xs uppercase tracking-wider">
                      {trimData ? 'Adjust Video Trim' : 'Trim Video'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Image source={{ uri: media.uri }} className="w-full h-56" resizeMode="contain" />
              )}
              
              <TouchableOpacity 
                onPress={() => { setMedia(null); setTrimData(null); }}
                className="absolute top-3.5 right-3.5 bg-black/60 p-2.5 rounded-full"
              >
                <Trash2 size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Step 2: Details */}
        <View className="mb-8">
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-base mb-3">
            2. Asset Name & Tags
          </Text>
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="border rounded-3xl p-5 shadow-sm"
          >
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-widest mb-2.5">
              Creative Name
            </Text>
            <TextInput
              style={{ 
                backgroundColor: isDark ? '#181033' : '#F8F7FF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE',
                color: isDark ? '#F8FAFC' : '#1E1B4B' 
              }}
              className="border rounded-2xl px-4 py-3.5 text-sm font-semibold"
              placeholder="e.g. Navratri Festival Mega Sale 2026"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={form.title}
              onChangeText={(t) => setForm({...form, title: t})}
            />
          </View>
        </View>

        {/* Upload Button */}
        <TouchableOpacity 
          onPress={handleUpload}
          disabled={!form.title || !media || loading}
          className="rounded-2xl overflow-hidden shadow-lg mb-10 w-full"
          style={{ 
            shadowColor: '#9333EA', 
            shadowRadius: 10, 
            shadowOpacity: 0.35,
            opacity: (!form.title || !media || loading) ? 0.5 : 1 
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '100%',
              height: 54,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <UploadCloud size={19} color="#FFFFFF" strokeWidth={2.4} />
                <Text 
                  style={{ 
                    color: '#FFFFFF', 
                    fontWeight: '900', 
                    fontSize: 14, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.8, 
                    textAlign: 'center',
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  }}
                >
                  Save to Media
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
