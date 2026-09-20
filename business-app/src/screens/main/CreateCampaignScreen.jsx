import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Modal, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Video, 
  Image as ImageIcon, 
  MapPin, 
  Check, 
  Plus, 
  Calendar, 
  MonitorSmartphone, 
  CheckCircle2, 
  UploadCloud, 
  Trash2, 
  X, 
  Clock, 
  Sparkles, 
  Zap, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Wallet,
  Play,
  Pause
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { businessService } from '../../services/business';
import VideoTrimmer from '../../components/VideoTrimmer';
import AddFundsBottomSheet from '../../components/AddFundsBottomSheet';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

const { width } = Dimensions.get('window');

const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

// Dedicated Video Preview for Active Selection with Play/Pause
const VideoCardPreview = React.memo(({ uri, isDark }) => {
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

// Grid thumbnail preview for selecting ads
const VideoThumbnailPreview = React.memo(({ uri, isDark }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
  });

  return (
    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <VideoView 
        player={player} 
        style={{ width: '100%', height: '100%' }} 
        contentFit="cover" 
        nativeControls={false} 
      />
      <View className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-md flex-row items-center">
        <Video size={10} color="#38BDF8" style={{ marginRight: 4 }} />
        <Text className="text-white text-[9px] font-bold">VIDEO</Text>
      </View>
    </View>
  );
});

const ROUTES = [
  { id: '1', name: 'Bopal Area', brts: 10, screens: 20, area: 'Bopal' },
  { id: '2', name: 'Bapunagar Area', brts: 8, screens: 16, area: 'Bapunagar' },
  { id: '3', name: 'Ranip Area', brts: 12, screens: 24, area: 'Ranip' },
  { id: '4', name: 'Shivranjini Area', brts: 15, screens: 30, area: 'Shivranjini' },
  { id: '5', name: 'SG Highway', brts: 18, screens: 36, area: 'SG Highway' },
  { id: '6', name: 'Navrangpura Area', brts: 14, screens: 28, area: 'Navrangpura' },
];

const formatDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CreateCampaignScreen({ route, navigation }) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 24 : 16);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [showPicker, setShowPicker] = useState({
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false,
  });

  function openPicker(key) {
    setShowPicker({
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false,
      [key]: true,
    });
  }

  function closePicker() {
    setShowPicker({
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false,
    });
  }

  function formatDate(date) {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(date) {
    if (!date) return 'Select time';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const [step, setStep] = useState(1);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [walletData, setWalletData] = useState({
    total: 0,
    onHold: 0,
    active: 0,
  });
  const [holdModalVisible, setHoldModalVisible] = useState(false);
  const [holdModalData, setHoldModalData] = useState({
    active: 0,
    onHold: 0,
    total: 0,
    required: 0,
    shortfall: 0,
  });

  // New Ad Upload State (Step 1 Inline Upload)
  const [uploadMode, setUploadMode] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdMedia, setNewAdMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoTrimmerVisible, setVideoTrimmerVisible] = useState(false);
  const [addFundsVisible, setAddFundsVisible] = useState(false);

  // Where selector mode
  const [whereMode, setWhereMode] = useState('everywhere'); // 'everywhere' | 'specific'

  const [form, setForm] = useState({
    ad: null, 
    routes: [], 
    trimStart: '0',
    trimEnd: '0',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [adsRes, walletRes] = await Promise.all([
        businessService.getAds(),
        businessService.getWallet().catch(() => ({ success: false }))
      ]);
      
      let fetchedAds = [];
      if (adsRes.success) {
        fetchedAds = adsRes.ads || [];
        setAds(fetchedAds);
      }
      
      if (walletRes.success) {
        const total = parseFloat(walletRes.total_balance !== undefined ? walletRes.total_balance : (walletRes.wallet_balance || 0));
        const onHold = parseFloat(walletRes.on_hold || 0);
        const active = parseFloat(walletRes.active_balance !== undefined ? walletRes.active_balance : Math.max(0, total - onHold));
        setWalletData({ total, onHold, active });
      }

      if (route.params?.preselectedAdId) {
        const preAd = fetchedAds.find(a => a.id === route.params.preselectedAdId);
        if (preAd) {
          setForm(prev => ({ ...prev, ad: preAd }));
        } else {
          const isVideo = route.params.preselectedMediaType === 'video' || (route.params.preselectedMediaUri && route.params.preselectedMediaUri.toLowerCase().endsWith('.mp4'));
          const mockAd = { 
            id: route.params.preselectedAdId, 
            title: route.params.preselectedAdTitle || 'New Uploaded Ad',
            media_type: isVideo ? 'video' : 'image',
            type: isVideo ? 'video' : 'image',
            file_url: route.params.preselectedMediaUri || null,
            play_duration: route.params.preselectedPlayDuration || 30
          };
          setForm(prev => ({ ...prev, ad: mockAd }));
          setAds([mockAd, ...fetchedAds]);
        }
      } else if (fetchedAds.length > 0) {
        setForm(prev => ({ ...prev, ad: fetchedAds[0] }));
      } else {
        setForm(prev => ({ ...prev, ad: null }));
        setUploadMode(true);
      }

      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '4')] }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

  const pickMedia = async (mediaType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video' ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        const durationSec = asset.duration ? (asset.duration > 1000 ? asset.duration / 1000 : asset.duration) : 0;
        if (durationSec > 0 && durationSec < 20) {
          Alert.alert(
            'Video Too Short',
            `Transit campaign videos must be at least 20 seconds long. The selected video is only ${durationSec.toFixed(1)} seconds. Please choose a video of 20 seconds or longer.`
          );
          return;
        }
        const validDur = durationSec > 0 ? durationSec : 20;
        setForm(prev => ({ ...prev, trimStart: '0', trimEnd: String(Math.floor(validDur)) }));
        setNewAdMedia(asset);
        setVideoTrimmerVisible(true);
      } else {
        setNewAdMedia(asset);
      }
    }
  };

  const handleInlineUpload = async (advanceToNextStep = false) => {
    if (!newAdTitle.trim() || !newAdMedia) {
      Alert.alert('Incomplete Creative', 'Please provide a creative title and select a media file.');
      return false;
    }

    const duration = newAdMedia.type === 'image' ? 30 : (parseInt(form.trimEnd) - parseInt(form.trimStart));
    if (newAdMedia.type === 'video' && duration < 20) {
      Alert.alert('Invalid Duration', 'Transit campaign videos must be at least 20 seconds long.');
      return false;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newAdTitle.trim());
      formData.append('budget', '0');
      formData.append('cost_per_play', '0');
      
      const duration = newAdMedia.type === 'image' ? 30 : (parseInt(form.trimEnd) - parseInt(form.trimStart));
      formData.append('play_duration', String(duration));
      formData.append('video_trim_start', form.trimStart);
      formData.append('video_trim_end', form.trimEnd);
      formData.append('media', {
        uri: newAdMedia.uri,
        name: newAdMedia.fileName || `upload.${newAdMedia.uri.split('.').pop()}`,
        type: newAdMedia.mimeType || (newAdMedia.type === 'video' ? 'video/mp4' : 'image/jpeg')
      });

      const res = await businessService.uploadAd(formData);
      if (res.success) {
        const adsRes = await businessService.getAds();
        let updatedAds = ads;
        if (adsRes.success) {
          updatedAds = adsRes.ads || [];
          setAds(updatedAds);
        }
        
        const newAd = updatedAds.find(a => a.id === res.ad?.id || a.title === newAdTitle.trim()) || {
          id: res.ad?.id || Date.now(),
          title: newAdTitle.trim(),
          media_type: newAdMedia.type,
          type: newAdMedia.type,
          file_url: res.media?.file_url || res.ad?.file_url || newAdMedia.uri,
          play_duration: duration
        };

        setForm(prev => ({ ...prev, ad: newAd }));
        setUploadMode(false);
        setNewAdTitle('');
        setNewAdMedia(null);
        
        if (advanceToNextStep) {
          setStep(2);
        } else {
          Alert.alert('Success', 'Creative uploaded and selected.');
        }
        return true;
      } else {
        Alert.alert('Error', res.message || 'Failed to upload creative.');
        return false;
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.response?.data?.message || err.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const toggleRoute = (routeItem) => {
    if (form.routes.find(r => r.id === routeItem.id)) {
      if (form.routes.length === 1) return;
      setForm({ ...form, routes: form.routes.filter(r => r.id !== routeItem.id) });
    } else {
      setForm({ ...form, routes: [...form.routes, routeItem] });
    }
  };

  const handleWhereModeChange = (mode) => {
    setWhereMode(mode);
    if (mode === 'everywhere') {
      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '4')] }));
    } else {
      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '1')] }));
    }
  };

  const totalSelectedBrts = form.routes.reduce((acc, r) => acc + (r?.brts || 0), 0);
  const totalSelectedScreens = form.routes.reduce((acc, r) => acc + (r?.screens || 0), 0);

  const adDurationSeconds = useMemo(() => {
    if (!form.ad) return 0;
    if (form.ad.media_type === 'image' || form.ad.type === 'image') return 30;
    if (form.ad.media_type === 'video' || form.ad.type === 'video') {
      const trimmedDuration = parseInt(form.trimEnd || 0) - parseInt(form.trimStart || 0);
      if (trimmedDuration > 0) return Math.floor(trimmedDuration);
      return Math.floor(form.ad.play_duration || 15);
    }
    return 30;
  }, [form.ad, form.trimStart, form.trimEnd]);

  const scheduledDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
  }, [startDate, endDate]);

  const dailySlotSeconds = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;
    const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;
    if (endSeconds <= startSeconds) return 0;
    return endSeconds - startSeconds;
  }, [startTime, endTime]);

  const playsPerDay = useMemo(() => {
    if (!adDurationSeconds || !dailySlotSeconds) return 0;
    return Math.floor(dailySlotSeconds / adDurationSeconds);
  }, [adDurationSeconds, dailySlotSeconds]);

  const totalPlays = useMemo(() => {
    return playsPerDay * scheduledDays;
  }, [playsPerDay, scheduledDays]);

  const totalPlaybackSeconds = useMemo(() => {
    return totalPlays * adDurationSeconds;
  }, [totalPlays, adDurationSeconds]);

  const RATE_PER_SECOND = 0.35;

  const estimatedCost = useMemo(() => {
    return totalPlaybackSeconds * RATE_PER_SECOND;
  }, [totalPlaybackSeconds]);

  const safeDuration = Number(adDurationSeconds) || 0;
  const safeCost = Number(estimatedCost) || 0;
  const safeWalletBalance = Number(walletData.active) || 0; // Active available balance to launch new campaigns
  const safeTotalBalance = Number(walletData.total) || 0;
  const safeOnHoldBalance = Number(walletData.onHold) || 0;
  const safePlaysPerDay = Number(playsPerDay) || 0;
  const safeTotalPlays = Number(totalPlays) || 0;
  const safeScheduledDays = Number(scheduledDays) || 0;

  const handleNext = async () => {
    if (step === 1) {
      if (uploadMode) {
        if (!newAdMedia || !newAdTitle.trim()) {
          return Alert.alert(
            'Incomplete Creative',
            'Please choose a media file (video or image) and enter a creative name before proceeding to Step 2.'
          );
        }
        await handleInlineUpload(true);
        return;
      }

      if (!form.ad || !form.ad.id) {
        return Alert.alert('Creative Required', 'Please select or upload an approved creative for your campaign.');
      }
    }
    if (step === 2 && (!form.routes || form.routes.length === 0)) {
      return Alert.alert('Required', 'Please select at least one transit route.');
    }
    if (step === 3) {
      if (!startDate || !endDate || !startTime || !endTime) return Alert.alert('Required', 'Please configure your dates and daily hours.');
      
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      sd.setHours(0, 0, 0, 0);
      ed.setHours(0, 0, 0, 0);
      
      if (ed < sd) return Alert.alert('Invalid Date', 'End date cannot be earlier than start date.');
      
      const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;
      const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;
      if (endSeconds <= startSeconds) return Alert.alert('Invalid Time', 'End time must be later than start time.');
    }
    if (step === 4) {
      if (safeCost > safeWalletBalance) {
        const shortfall = safeCost - safeWalletBalance;
        setHoldModalData({
          active: safeWalletBalance,
          onHold: safeOnHoldBalance,
          total: safeTotalBalance,
          required: safeCost,
          shortfall: shortfall,
        });
        setHoldModalVisible(true);
        return;
      }
      handleLaunch();
      return;
    }
    setStep(step + 1);
  };

  const handleLaunch = async () => {
    if (safeCost > safeWalletBalance) {
      const shortfall = safeCost - safeWalletBalance;
      setHoldModalData({
        active: safeWalletBalance,
        onHold: safeOnHoldBalance,
        total: safeTotalBalance,
        required: safeCost,
        shortfall: shortfall,
      });
      setHoldModalVisible(true);
      return;
    }

    setCreating(true);
    try {
      const selectedAreas = whereMode === 'everywhere' ? 'all' : form.routes.map(r => r.area).join(', ');
      
      const payload = {
        campaign_name: `${form.ad.title} Transit Campaign`,
        start_date: startDate ? formatDateString(startDate) : null,
        end_date: endDate ? formatDateString(endDate) : null,
        start_time: startTime ? `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}` : null,
        end_time: endTime ? `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}` : null,
        budget: safeCost,
        daily_budget: 0,
        area: selectedAreas,
        ad_ids: [form.ad.id]
      };
      
      const res = await businessService.createCampaign(payload);
      if (res.success) {
        setStep(6);
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (err) {
      if (err.response?.data?.code === 'INSUFFICIENT_ACTIVE_BALANCE' || err.response?.data?.wallet) {
        const w = err.response?.data?.wallet || {};
        const total = parseFloat(w.total_balance !== undefined ? w.total_balance : safeTotalBalance);
        const onHold = parseFloat(w.on_hold !== undefined ? w.on_hold : safeOnHoldBalance);
        const active = parseFloat(w.active_balance !== undefined ? w.active_balance : safeWalletBalance);
        const req = parseFloat(w.required || safeCost);
        const shortfall = parseFloat(w.shortfall || Math.max(0, req - active));

        setWalletData({ total, onHold, active });
        setHoldModalData({
          active,
          onHold,
          total,
          required: req,
          shortfall,
        });
        setHoldModalVisible(true);
      } else {
        Alert.alert('Failed', err.response?.data?.message || 'Failed to launch advertisement');
      }
    } finally {
      setCreating(false);
    }
  };

  // SUCCESS STEP (Step 6)
  if (step === 6) {
    const locationsText = whereMode === 'everywhere' ? 'Citywide Fleet' : `${form.routes.length} Corridor${form.routes.length > 1 ? 's' : ''}`;
    
    return (
      <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 60 + bottomInset }}>
          
          {/* Hero Section */}
          <View className="items-center mb-8">
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#C084FC']}
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-lg"
              style={{ shadowColor: '#9333EA', shadowRadius: 15, shadowOpacity: 0.4 }}
            >
              <CheckCircle2 size={40} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>

            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black text-center mb-2 tracking-tight">
              Campaign Submitted!
            </Text>
            
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-center text-sm font-medium leading-relaxed px-4">
              "{form.ad?.title}" is scheduled and submitted for automated transit screen compliance verification.
            </Text>
          </View>

          {/* Status Timeline Card */}
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE',
              shadowColor: isDark ? '#7C3AED' : '#9333EA',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
            }}
            className="border rounded-3xl p-5 mb-5"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2.5 shadow-sm" />
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold uppercase text-xs tracking-wider">
                Status: Pending Approval
              </Text>
            </View>
            
            {/* Timeline */}
            <View className="ml-1 my-2">
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 items-center justify-center z-10">
                  <Check size={12} color="#10B981" strokeWidth={3} />
                </View>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="ml-3 font-bold text-xs">Campaign Configured & Submitted</Text>
              </View>
              
              <View className="absolute left-[11px] top-4 w-[2px] h-10 bg-purple-500/30" />
              
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 items-center justify-center z-10">
                  <Clock size={12} color="#F59E0B" />
                </View>
                <Text className="ml-3 font-bold text-xs text-amber-500">Security & Display QA in Progress</Text>
              </View>
              
              <View className="absolute left-[11px] top-[52px] w-[2px] h-10 bg-purple-500/20" />
              
              <View className="flex-row items-center">
                <View 
                  style={{ backgroundColor: isDark ? '#1F1735' : '#F1F5F9', borderColor: isDark ? '#3B2A68' : '#CBD5E1' }}
                  className="w-6 h-6 rounded-full border items-center justify-center z-10"
                >
                  <Sparkles size={11} color={isDark ? '#64748B' : '#94A3B8'} />
                </View>
                <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="ml-3 font-bold text-xs">Live Broadcast on City Screens</Text>
              </View>
            </View>
          </View>

          {/* Details Card */}
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#281B4B' : '#EDE9FE' 
            }}
            className="border rounded-3xl p-5 mb-6"
          >
            <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[11px] font-black uppercase tracking-widest mb-4">
              Flight Summary
            </Text>

            <View className="flex-row justify-between mb-3 items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Creative</Text>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-bold">{form.ad?.title}</Text>
            </View>
            
            <View className="flex-row justify-between mb-3 items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Target Network</Text>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-bold">{locationsText}</Text>
            </View>
            
            <View className="flex-row justify-between mb-4 items-center">
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Scheduled Flight</Text>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-bold">{formatDate(startDate)} → {formatDate(endDate)}</Text>
            </View>
            
            <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="h-px w-full mb-4" />
            
            <View className="flex-row justify-between items-center">
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-bold">Estimated Cost</Text>
              <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="font-black text-lg">₹{safeCost.toFixed(2)}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 pb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'My Ads' })}
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{ shadowColor: '#9333EA', shadowRadius: 10, shadowOpacity: 0.35 }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#9333EA', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center flex-row"
              >
                <Text className="text-white font-extrabold text-sm tracking-wide">View In Campaigns →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              style={{ 
                backgroundColor: isDark ? '#181033' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="py-4 rounded-2xl items-center border"
              activeOpacity={0.8}
            >
              <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="font-bold text-sm">Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    );
  }

  const stepsList = [
    { num: 1, label: 'Creative' },
    { num: 2, label: 'Network' },
    { num: 3, label: 'Schedule' },
    { num: 4, label: 'Review' },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      {/* Top Header */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE'
        }}
        className="px-5 py-4 border-b z-10 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} 
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
              Create Campaign
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] font-semibold">
              Step {step} of 4: {stepsList[step - 1]?.label}
            </Text>
          </View>
        </View>

        <View 
          style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
          className="px-3 py-1.5 rounded-full flex-row items-center"
        >
          <Zap size={13} color="#A855F7" />
          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black ml-1">
            ₹{safeWalletBalance.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Modern Stepper Indicator */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE'
        }}
        className="px-6 py-3 border-b flex-row justify-between items-center"
      >
        {stepsList.map((item, idx) => {
          const isDone = step > item.num;
          const isCurrent = step === item.num;
          return (
            <React.Fragment key={item.num}>
              <View className="items-center">
                {isCurrent ? (
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA', '#C084FC']}
                    className="w-7 h-7 rounded-full items-center justify-center shadow-sm"
                  >
                    <Text className="text-white text-xs font-black">{item.num}</Text>
                  </LinearGradient>
                ) : isDone ? (
                  <View style={{ backgroundColor: '#10B981' }} className="w-7 h-7 rounded-full items-center justify-center">
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : (
                  <View 
                    style={{ 
                      backgroundColor: isDark ? '#181033' : '#F1F5F9',
                      borderColor: isDark ? '#281B4B' : '#E2E8F0' 
                    }} 
                    className="w-7 h-7 rounded-full items-center justify-center border"
                  >
                    <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-xs font-bold">{item.num}</Text>
                  </View>
                )}
                <Text 
                  style={{ 
                    color: isCurrent ? (isDark ? '#C084FC' : '#7C3AED') : isDone ? '#10B981' : (isDark ? '#64748B' : '#94A3B8'),
                    fontWeight: isCurrent ? '800' : '600'
                  }} 
                  className="text-[10px] mt-1 tracking-wider uppercase"
                >
                  {item.label}
                </Text>
              </View>

              {idx < stepsList.length - 1 && (
                <View 
                  style={{ 
                    backgroundColor: isDone ? '#10B981' : (isDark ? '#281B4B' : '#E2E8F0') 
                  }} 
                  className="flex-1 h-[2px] mx-2 -mt-4" 
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 18, paddingBottom: 140 + bottomInset }}>
        
        {/* STEP 1: AD CREATIVE */}
        {step === 1 && (
          <View>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight mb-1.5">
              Select Creative
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium mb-5 leading-relaxed">
              Choose an approved graphic or video from your media library or upload a new asset.
            </Text>

            {uploadMode ? (
              // Inline Upload Box
              <View 
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#7C3AED' : '#C084FC' 
                }}
                className="border-2 rounded-3xl p-5 mb-6 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Sparkles size={16} color="#A855F7" style={{ marginRight: 6 }} />
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">Upload Creative</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      if (ads.length === 0) {
                        Alert.alert('Upload Required', 'Your media library is empty. Please upload a creative to continue.');
                        return;
                      }
                      setUploadMode(false);
                      if (!form.ad && ads.length > 0) {
                        setForm(prev => ({ ...prev, ad: ads[0] }));
                      }
                    }} 
                    style={{ backgroundColor: isDark ? '#1F1735' : '#F1F5F9' }}
                    className="p-1.5 rounded-full"
                  >
                    <X size={14} color={isDark ? '#CBD5E1' : '#64748B'} />
                  </TouchableOpacity>
                </View>

                {!newAdMedia ? (
                  <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity 
                      onPress={() => pickMedia('image')}
                      style={{ 
                        backgroundColor: isDark ? '#181033' : '#F8F7FF',
                        borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                      }}
                      className="flex-1 py-6 rounded-2xl items-center border"
                    >
                      <View style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-2">
                        <ImageIcon size={24} color="#A855F7" />
                      </View>
                      <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xs">Upload Image</Text>
                      <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] mt-0.5">PNG, JPG up to 10MB</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => pickMedia('video')}
                      style={{ 
                        backgroundColor: isDark ? '#181033' : '#F8F7FF',
                        borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                      }}
                      className="flex-1 py-6 rounded-2xl items-center border"
                    >
                      <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)' }} className="w-12 h-12 rounded-2xl items-center justify-center mb-2">
                        <Video size={24} color="#38BDF8" />
                      </View>
                      <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xs">Upload Video</Text>
                      <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] mt-0.5">MP4 with custom trimmer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mb-4">
                    <View 
                      style={{ borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
                      className="relative h-44 rounded-2xl overflow-hidden border mb-3"
                    >
                      {newAdMedia.type === 'video' ? (
                        <View style={{ backgroundColor: '#090614' }} className="w-full h-full items-center justify-center">
                          <Video size={36} color="#38BDF8" className="mb-2" />
                          <Text className="text-slate-300 text-xs font-bold">{newAdMedia.fileName || 'Video selected'}</Text>
                        </View>
                      ) : (
                        <Image source={{ uri: newAdMedia.uri }} className="w-full h-full" resizeMode="cover" />
                      )}
                      <TouchableOpacity 
                        onPress={() => setNewAdMedia(null)} 
                        className="absolute top-2.5 right-2.5 bg-black/60 p-2 rounded-full"
                      >
                        <Trash2 size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {newAdMedia.type === 'video' && (
                      <View 
                        style={{ backgroundColor: isDark ? '#181033' : '#F8F7FF', borderColor: isDark ? '#281B4B' : '#EDE9FE' }}
                        className="p-3.5 rounded-xl border flex-row justify-between items-center"
                      >
                        <View className="flex-row items-center flex-1">
                          <CheckCircle2 size={18} color="#10B981" />
                          <View className="ml-2.5">
                            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xs">Video Selected</Text>
                            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px]">Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0}s</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => setVideoTrimmerVisible(true)}
                          style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }}
                          className="px-3 py-1.5 rounded-lg"
                        >
                          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-bold text-xs">Edit Trim</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] font-bold uppercase tracking-wider mb-2">
                  Creative Name
                </Text>
                <TextInput
                  value={newAdTitle}
                  onChangeText={setNewAdTitle}
                  placeholder="e.g. Diwali Weekend Special Promo"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={{ 
                    backgroundColor: isDark ? '#181033' : '#F8F7FF',
                    borderColor: isDark ? '#281B4B' : '#EDE9FE',
                    color: isDark ? '#F8FAFC' : '#1E1B4B' 
                  }}
                  className="border rounded-xl px-4 py-3 font-semibold mb-4 text-sm"
                />

                <TouchableOpacity 
                  onPress={() => handleInlineUpload(false)}
                  disabled={uploading || !newAdTitle.trim() || !newAdMedia}
                  className="rounded-xl overflow-hidden shadow-md"
                  style={{ shadowColor: '#9333EA', shadowRadius: 8, opacity: (uploading || !newAdTitle.trim() || !newAdMedia) ? 0.6 : 1 }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA', '#C084FC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: '100%',
                      height: 48,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <UploadCloud size={18} color="#FFF" />
                        <Text 
                          style={{
                            color: '#FFFFFF',
                            fontWeight: '900',
                            fontSize: 13,
                            textTransform: 'uppercase',
                            letterSpacing: 0.6,
                            textAlign: 'center',
                            includeFontPadding: false,
                            textAlignVertical: 'center',
                          }}
                          numberOfLines={1}
                        >
                          Save & Select Creative
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  setUploadMode(true);
                  setNewAdMedia(null);
                  setNewAdTitle('');
                }}
                style={{ 
                  backgroundColor: isDark ? 'rgba(124, 58, 237, 0.08)' : '#F8F7FF',
                  borderColor: isDark ? '#7C3AED' : '#C084FC',
                  borderStyle: 'dashed'
                }}
                className="border-2 rounded-3xl p-6 items-center justify-center mb-5"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#7C3AED', '#4C1D95'] : ['#EDE9FE', '#DDD6FE']}
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2.5 shadow-sm"
                >
                  <Plus size={22} color={isDark ? '#FFFFFF' : '#7C3AED'} />
                </LinearGradient>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm mb-0.5">Upload New Creative</Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium">Supports MP4 Video & High-Res JPG/PNG</Text>
              </TouchableOpacity>
            )}

            {/* Active Selected Creative Preview Card */}
            {form.ad && !uploadMode && (
              <View 
                style={{
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#7C3AED' : '#C084FC',
                  shadowColor: '#9333EA',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 10,
                  elevation: 4
                }}
                className="border-2 rounded-3xl mb-6 overflow-hidden"
              >
                {/* Hero Media Preview */}
                <View style={{ backgroundColor: isDark ? '#090614' : '#F1F5F9' }} className="h-48 relative items-center justify-center">
                  {(() => {
                    const isVideo = form.ad.media_type === 'video' || form.ad.type === 'video' || (form.ad.file_url && form.ad.file_url.toLowerCase().endsWith('.mp4'));
                    const mediaUri = form.ad.file_url ? (form.ad.file_url.startsWith('http') ? form.ad.file_url : `${getBaseUrl().replace('/api', '')}${form.ad.file_url.startsWith('/') ? '' : '/'}${form.ad.file_url}`) : null;
                    
                    if (mediaUri) {
                      return isVideo ? (
                        <VideoCardPreview uri={mediaUri} isDark={isDark} />
                      ) : (
                        <Image 
                          source={{ uri: mediaUri }} 
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      );
                    }
                    return (
                      <View className="w-full h-full items-center justify-center">
                        {isVideo ? <Video size={48} color={isDark ? '#38BDF8' : '#0284C7'} /> : <ImageIcon size={48} color="#A855F7" />}
                      </View>
                    );
                  })()}
                </View>

                {/* Selected Details Bar */}
                <View className="p-4 flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                      <Text style={{ color: '#10B981' }} className="text-[10px] font-black uppercase tracking-wider">
                        Selected for Campaign
                      </Text>
                    </View>
                    <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-base tracking-tight" numberOfLines={1}>
                      {form.ad.title}
                    </Text>
                  </View>

                  <View 
                    style={{ 
                      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#EDE9FE',
                      borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#DDD6FE'
                    }}
                    className="border px-3 py-1.5 rounded-full flex-row items-center"
                  >
                    <Sparkles size={12} color="#A855F7" style={{ marginRight: 5 }} />
                    <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">
                      {safeDuration}s Flight
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {ads.length > 0 && !uploadMode && (
              <View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-black uppercase tracking-wider mb-3">
                  Media Library Assets
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {ads.map(ad => {
                    const isSelected = form.ad?.id === ad.id;
                    const isVideo = ad.media_type === 'video' || ad.type === 'video' || (ad.file_url && ad.file_url.toLowerCase().endsWith('.mp4'));
                    const mediaUri = ad.file_url ? (ad.file_url.startsWith('http') ? ad.file_url : `${getBaseUrl().replace('/api', '')}${ad.file_url.startsWith('/') ? '' : '/'}${ad.file_url}`) : null;

                    return (
                      <TouchableOpacity 
                        key={ad.id} 
                        onPress={() => setForm({ ...form, ad })}
                        style={{ 
                          width: (width - 48) / 2,
                          borderColor: isSelected ? '#A855F7' : (isDark ? '#281B4B' : '#EDE9FE'),
                          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                          shadowColor: isSelected ? '#A855F7' : 'transparent',
                          shadowRadius: isSelected ? 8 : 0,
                          shadowOpacity: isSelected ? 0.3 : 0,
                        }}
                        className="h-44 rounded-2xl mb-4 overflow-hidden border-2 relative"
                        activeOpacity={0.8}
                      >
                        {mediaUri ? (
                          isVideo ? (
                            <VideoThumbnailPreview uri={mediaUri} isDark={isDark} />
                          ) : (
                            <Image 
                              source={{ uri: mediaUri }} 
                              className="w-full h-full" 
                              resizeMode="cover" 
                            />
                          )
                        ) : (
                          <View style={{ backgroundColor: isDark ? '#181033' : '#F1F5F9' }} className="w-full h-full items-center justify-center">
                            {isVideo ? <Video size={32} color="#38BDF8" /> : <ImageIcon size={32} color="#A855F7" />}
                          </View>
                        )}
                        
                        <LinearGradient
                          colors={['transparent', 'rgba(9, 6, 20, 0.9)']}
                          className="absolute inset-0 justify-end p-2.5"
                        >
                          <Text className="text-white text-xs font-black" numberOfLines={1}>{ad.title}</Text>
                          <Text className="text-purple-300 text-[10px] font-semibold">
                            {isVideo ? 'Video' : 'Static Image'}
                          </Text>
                        </LinearGradient>
                        
                        {isSelected && (
                          <View className="absolute top-2 right-2 bg-[#7C3AED] w-6 h-6 rounded-full items-center justify-center shadow-md z-20">
                            <Check size={14} color="#FFF" strokeWidth={3} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: WHERE */}
        {step === 2 && (
          <View>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight mb-1.5">
              Target Corridors
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium mb-5 leading-relaxed">
              Broadcast across the entire city transit grid or target specific commuter routes.
            </Text>

            {/* Everywhere vs Specific Buttons */}
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity 
                onPress={() => handleWhereModeChange('everywhere')}
                style={{ 
                  backgroundColor: whereMode === 'everywhere' 
                    ? (isDark ? '#201642' : '#EDE9FE') 
                    : (isDark ? '#140F24' : '#FFFFFF'),
                  borderColor: whereMode === 'everywhere' ? '#7C3AED' : (isDark ? '#281B4B' : '#EDE9FE')
                }}
                className="flex-1 p-4 rounded-3xl border-2"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">Citywide Grid</Text>
                  {whereMode === 'everywhere' && <CheckCircle2 size={16} color="#A855F7" />}
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] leading-relaxed">Maximum impressions across all city transit vehicles.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleWhereModeChange('specific')}
                style={{ 
                  backgroundColor: whereMode === 'specific' 
                    ? (isDark ? '#201642' : '#EDE9FE') 
                    : (isDark ? '#140F24' : '#FFFFFF'),
                  borderColor: whereMode === 'specific' ? '#7C3AED' : (isDark ? '#281B4B' : '#EDE9FE')
                }}
                className="flex-1 p-4 rounded-3xl border-2"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-black text-sm">Target Routes</Text>
                  {whereMode === 'specific' && <CheckCircle2 size={16} color="#A855F7" />}
                </View>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-[11px] leading-relaxed">Pinpoint high-density shopping and business corridors.</Text>
              </TouchableOpacity>
            </View>

            {/* Reach Summary Card */}
            <LinearGradient
              colors={['#7C3AED', '#5B21B6']}
              className="rounded-2xl p-4 mb-5 flex-row justify-between items-center shadow-lg"
              style={{ shadowColor: '#7C3AED', shadowRadius: 10, shadowOpacity: 0.3 }}
            >
              <View>
                <Text className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-0.5">Estimated Fleet Reach</Text>
                <Text className="text-white font-black text-lg">{totalSelectedScreens} Active Displays</Text>
                <Text className="text-purple-200 text-xs font-semibold">Broadcasting on {totalSelectedBrts} Transit Vehicles</Text>
              </View>
              <View className="w-10 h-10 bg-white/15 rounded-2xl items-center justify-center">
                <MonitorSmartphone size={22} color="#FFFFFF" />
              </View>
            </LinearGradient>

            {whereMode === 'specific' && ROUTES.map(routeItem => {
              const isSelected = form.routes.find(r => r.id === routeItem.id);
              return (
                <TouchableOpacity 
                  key={routeItem.id}
                  onPress={() => toggleRoute(routeItem)}
                  style={{ 
                    backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                    borderColor: isSelected ? '#A855F7' : (isDark ? '#281B4B' : '#EDE9FE')
                  }}
                  className="border-2 rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View 
                      style={{ backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.15)' : (isDark ? '#181033' : '#F1F5F9') }}
                      className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
                    >
                      <MapPin size={20} color={isSelected ? '#A855F7' : (isDark ? '#64748B' : '#94A3B8')} />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm tracking-tight mb-0.5">{routeItem.name}</Text>
                      <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium">{routeItem.brts} Transit Buses • {routeItem.screens} Displays</Text>
                    </View>
                  </View>
                  <View 
                    style={{ 
                      borderColor: isSelected ? '#A855F7' : (isDark ? '#3B2A68' : '#CBD5E1'),
                      backgroundColor: isSelected ? '#7C3AED' : 'transparent' 
                    }}
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                  >
                    {isSelected && <Check size={13} color="#FFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 3: SCHEDULE */}
        {step === 3 && (
          <View>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight mb-1.5">
              Flight Schedule
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium mb-5 leading-relaxed">
              Set your broadcast date range and daily active hours for live playback.
            </Text>

            {/* Date Pickers */}
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-black uppercase tracking-wider mb-2">
              Broadcast Dates
            </Text>
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity 
                onPress={() => openPicker('startDate')}
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="flex-row items-center border rounded-2xl p-3.5 flex-1 shadow-sm"
              >
                <Calendar size={18} color="#A855F7" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold uppercase">Start Date</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs mt-0.5">{formatDate(startDate)}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openPicker('endDate')}
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="flex-row items-center border rounded-2xl p-3.5 flex-1 shadow-sm"
              >
                <Calendar size={18} color="#A855F7" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold uppercase">End Date</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs mt-0.5">{formatDate(endDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Time Slot Pickers */}
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-black uppercase tracking-wider mb-2">
              Daily Broadcasting Hours
            </Text>
            <View className="flex-row items-center gap-3 mb-5">
              <TouchableOpacity 
                onPress={() => openPicker('startTime')}
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="flex-row items-center border rounded-2xl p-3.5 flex-1 shadow-sm"
              >
                <Clock size={18} color="#A855F7" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold uppercase">Start Time</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs mt-0.5">{formatTime(startTime)}</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => openPicker('endTime')}
                style={{ 
                  backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                  borderColor: isDark ? '#281B4B' : '#EDE9FE' 
                }}
                className="flex-row items-center border rounded-2xl p-3.5 flex-1 shadow-sm"
              >
                <Clock size={18} color="#A855F7" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold uppercase">End Time</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-bold text-xs mt-0.5">{formatTime(endTime)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {(startDate && endDate && startTime && endTime) && (
              <View 
                style={{ 
                  backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : '#F8F7FF',
                  borderColor: isDark ? '#7C3AED' : '#DDD6FE' 
                }}
                className="border rounded-2xl p-4 mb-4"
              >
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black uppercase tracking-wider mb-3">
                  Flight Parameters
                </Text>
                
                <View className="flex-row items-center mb-2">
                  <CheckCircle2 size={15} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-semibold text-xs">
                    {safeScheduledDays} Total Days Scheduled
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <CheckCircle2 size={15} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-semibold text-xs">
                    {Math.floor(dailySlotSeconds / 3600)}h {Math.floor((dailySlotSeconds % 3600) / 60)}m Daily Broadcast Window
                  </Text>
                </View>
              </View>
            )}

            {/* Native Pickers */}
            {showPicker.startDate && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) {
                    setStartDate(selected);
                    if (endDate && selected > endDate) setEndDate(selected);
                  }
                }}
              />
            )}
            
            {showPicker.endDate && (
              <DateTimePicker
                value={endDate || startDate || new Date()}
                mode="date"
                display="default"
                minimumDate={startDate || new Date()}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setEndDate(selected);
                }}
              />
            )}
            
            {showPicker.startTime && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setStartTime(selected);
                }}
              />
            )}
            
            {showPicker.endTime && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                is24Hour={false}
                onChange={(event, selected) => {
                  closePicker();
                  if (event.type === 'dismissed') return;
                  if (selected) setEndTime(selected);
                }}
              />
            )}
          </View>
        )}

        {/* STEP 4: REVIEW & BUDGET */}
        {step === 4 && (
          <View>
            <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-2xl font-black tracking-tight mb-1.5">
              Review & Launch
            </Text>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium mb-5 leading-relaxed">
              Verify your flight specifications, audience scope, and estimated budget.
            </Text>

            {/* SUMMARY CARD */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="border rounded-2xl p-5 mb-4 shadow-sm overflow-hidden"
            >
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[11px] font-black uppercase tracking-widest mb-3">
                Campaign Summary
              </Text>

              {/* Creative Hero Preview */}
              {form.ad && (
                <View 
                  style={{ backgroundColor: isDark ? '#090614' : '#F1F5F9', borderColor: isDark ? '#281B4B' : '#EDE9FE' }} 
                  className="h-36 rounded-xl overflow-hidden border mb-4 relative items-center justify-center"
                >
                  {(() => {
                    const isVideo = form.ad.media_type === 'video' || form.ad.type === 'video' || (form.ad.file_url && form.ad.file_url.toLowerCase().endsWith('.mp4'));
                    const mediaUri = form.ad.file_url ? (form.ad.file_url.startsWith('http') ? form.ad.file_url : `${getBaseUrl().replace('/api', '')}${form.ad.file_url.startsWith('/') ? '' : '/'}${form.ad.file_url}`) : null;
                    
                    if (mediaUri) {
                      return isVideo ? (
                        <VideoCardPreview uri={mediaUri} isDark={isDark} />
                      ) : (
                        <Image 
                          source={{ uri: mediaUri }} 
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      );
                    }
                    return (
                      <View className="w-full h-full items-center justify-center">
                        {isVideo ? <Video size={36} color={isDark ? '#38BDF8' : '#0284C7'} /> : <ImageIcon size={36} color="#A855F7" />}
                      </View>
                    );
                  })()}
                </View>
              )}
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Creative</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold flex-1 text-right ml-4" numberOfLines={1}>{form.ad?.title}</Text>
              </View>
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Duration</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold">{safeDuration} seconds</Text>
              </View>

              <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="h-px w-full my-2.5" />

              <View className="flex-row justify-between mb-3 items-center">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Target Grid</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold">{whereMode === 'everywhere' ? 'Citywide Fleet' : `${form.routes.length} Corridors`}</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Daily Flight</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold">{formatTime(startTime)} – {formatTime(endTime)}</Text>
              </View>
            </View>

            {/* COST & WALLET BREAKDOWN */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="border rounded-2xl p-5 mb-5 shadow-sm"
            >
              <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[11px] font-black uppercase tracking-widest mb-4">
                Budget Breakdown
              </Text>
              
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Active Days</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold">{safeScheduledDays}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Est. Plays Per Day</Text>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-extrabold">{safePlaysPerDay}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Total Projected Plays</Text>
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-black">{safeTotalPlays}</Text>
              </View>

              <LinearGradient
                colors={isDark ? ['#1F1735', '#140F24'] : ['#EDE9FE', '#F8F7FF']}
                className="border border-purple-500/20 rounded-xl p-4 flex-row justify-between items-center mb-4"
              >
                <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-extrabold uppercase tracking-wide">Max Estimated Budget</Text>
                <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xl font-black">₹{safeCost.toFixed(2)}</Text>
              </LinearGradient>

              <View style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE' }} className="h-px w-full mb-4" />

              {/* 3-Part Wallet Balance Status */}
              <View className="flex-row justify-between items-center mb-2.5">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Active Balance</Text>
                </View>
                <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="text-xs font-extrabold">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>

              {safeOnHoldBalance > 0 && (
                <View className="flex-row justify-between items-center mb-2.5">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">On Hold (Pending)</Text>
                  </View>
                  <Text style={{ color: isDark ? '#FBBF24' : '#D97706' }} className="text-xs font-extrabold">₹{safeOnHoldBalance.toFixed(2)}</Text>
                </View>
              )}

              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Total Wallet Balance</Text>
                </View>
                <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xs font-bold">₹{safeTotalBalance.toFixed(2)}</Text>
              </View>
              
              {safeCost > safeWalletBalance ? (
                <View className="pt-2 border-t" style={{ borderTopColor: isDark ? '#281B4B' : '#EDE9FE' }}>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-rose-500 font-extrabold">Top-Up Needed</Text>
                    <Text className="text-sm font-black text-rose-500">
                      ₹{(safeCost - safeWalletBalance).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="pt-2 border-t" style={{ borderTopColor: isDark ? '#281B4B' : '#EDE9FE' }}>
                  <View className="flex-row justify-between items-center">
                    <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-xs font-semibold">Active Post-Flight</Text>
                    <Text className="text-sm font-black text-emerald-500">
                      ₹{(safeWalletBalance - safeCost).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
            
            {safeCost > safeWalletBalance ? (
              <View 
                style={{ 
                  backgroundColor: isDark ? '#1E121E' : '#FFF1F2',
                  borderColor: isDark ? '#4C1D2A' : '#FECDD3' 
                }}
                className="border rounded-2xl p-4 mb-4"
              >
                <View className="flex-row items-center mb-1.5">
                  <Text className="text-base mr-2">⚠️</Text>
                  <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-xs">
                    Insufficient Active Balance
                  </Text>
                </View>
                <Text style={{ color: isDark ? '#FDA4AF' : '#E11D48' }} className="text-xs font-medium mb-3 leading-relaxed">
                  {safeOnHoldBalance > 0 
                    ? `₹${safeOnHoldBalance.toFixed(0)} is on hold for pending campaigns. You need ₹${Math.ceil(safeCost - safeWalletBalance)} more active funds to launch.`
                    : `You need ₹${Math.ceil(safeCost - safeWalletBalance)} more in your wallet to launch this campaign.`
                  }
                </Text>
                
                <TouchableOpacity 
                  onPress={() => {
                    setHoldModalData({
                      active: safeWalletBalance,
                      onHold: safeOnHoldBalance,
                      total: safeTotalBalance,
                      required: safeCost,
                      shortfall: safeCost - safeWalletBalance,
                    });
                    setHoldModalVisible(true);
                  }}
                  className="rounded-xl overflow-hidden shadow-md"
                  style={{ shadowColor: '#9333EA', shadowRadius: 6 }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA', '#C084FC']}
                    className="py-3 items-center justify-center flex-row"
                  >
                    <Plus size={16} color="#FFFFFF" strokeWidth={3} className="mr-1" />
                    <Text className="text-white font-extrabold text-xs tracking-wider uppercase">
                      + Add ₹{Math.ceil(safeCost - safeWalletBalance)} to Wallet
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View 
                style={{ 
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.25)' 
                }}
                className="border rounded-2xl p-4 mb-4 flex-row items-center"
              >
                <ShieldCheck size={20} color="#10B981" style={{ marginRight: 10 }} />
                <Text className="text-emerald-500 font-bold text-xs flex-1">
                  Sufficient wallet funds available. Broadcast will initialize immediately after approval.
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderTopColor: isDark ? '#281B4B' : '#EDE9FE',
          paddingBottom: bottomInset + 14,
          paddingTop: 12,
          paddingHorizontal: 20
        }}
        className="border-t"
      >
        {step === 4 ? (
          <TouchableOpacity 
            onPress={handleLaunch} 
            disabled={creating}
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ 
              shadowColor: '#9333EA', 
              shadowRadius: 10, 
              shadowOpacity: 0.35,
              opacity: creating ? 0.5 : 1 
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: 52,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Sparkles size={18} color="#FFFFFF" />
              )}
              <Text 
                style={{
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  textAlign: 'center',
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                }}
                numberOfLines={1}
              >
                {creating ? 'Launching Flight...' : 'Confirm & Launch Campaign'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={uploading}
            className="rounded-2xl overflow-hidden shadow-lg"
            style={{ shadowColor: '#9333EA', shadowRadius: 10, shadowOpacity: 0.35, opacity: uploading ? 0.7 : 1 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                height: 52,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {uploading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text 
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '900',
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      textAlign: 'center',
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                    }}
                  >
                    Uploading Creative...
                  </Text>
                </>
              ) : (
                <>
                  <Text 
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '900',
                      fontSize: 14,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      textAlign: 'center',
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                    }}
                    numberOfLines={1}
                  >
                    Next Step
                  </Text>
                  <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Video Trimmer Modal */}
      <Modal visible={videoTrimmerVisible} animationType="slide" onRequestClose={() => setVideoTrimmerVisible(false)}>
        {newAdMedia && newAdMedia.type === 'video' && (
          <VideoTrimmer 
            uri={newAdMedia.uri} 
            originalDurationSec={newAdMedia.duration ? (newAdMedia.duration > 1000 ? newAdMedia.duration / 1000 : newAdMedia.duration) : 20}
            onSave={(trimData) => {
              if (trimData.start >= trimData.end) {
                Alert.alert('Invalid Trim', 'Start time must be less than end time.');
                return;
              }
              if (trimData.duration < 19.9) {
                Alert.alert('Invalid Duration', 'Transit campaign videos must be at least 20 seconds long.');
                return;
              }
              setForm(prev => ({
                ...prev,
                trimStart: String(Math.floor(trimData.start)),
                trimEnd: String(Math.ceil(trimData.end))
              }));
              setVideoTrimmerVisible(false);
            }}
            onCancel={() => setVideoTrimmerVisible(false)}
          />
        )}
      </Modal>

      {/* Funds On Hold / Insufficient Balance Breakdown Modal */}
      <Modal
        visible={holdModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHoldModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80 px-5">
          <View 
            style={{ 
              backgroundColor: isDark ? '#140F24' : '#FFFFFF',
              borderColor: isDark ? '#382260' : '#EDE9FE',
              shadowColor: '#9333EA',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 12,
              width: '100%',
              maxWidth: 400
            }}
            className="border rounded-[28px] p-6 overflow-hidden"
          >
            {/* Header Icon + Title */}
            <View className="items-center mb-5">
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                className="w-14 h-14 rounded-2xl items-center justify-center mb-3 shadow-md"
                style={{ shadowColor: '#F59E0B', shadowRadius: 8 }}
              >
                <Lock size={26} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black text-center tracking-tight">
                Funds On Hold
              </Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-medium text-center mt-1 px-2">
                Previous campaigns awaiting admin approval have reserved funds from your total wallet balance.
              </Text>
            </View>

            {/* Breakdown Card */}
            <View 
              style={{ 
                backgroundColor: isDark ? '#0D0818' : '#F8F7FF',
                borderColor: isDark ? '#281B4B' : '#E9E3FF' 
              }}
              className="border rounded-2xl p-4 mb-5"
            >
              {/* Active Balance */}
              <View className="flex-row justify-between items-center py-2.5 border-b" style={{ borderBottomColor: isDark ? '#1E1535' : '#EDE9FE' }}>
                <View className="flex-row items-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2" />
                  <Text style={{ color: isDark ? '#E2E8F0' : '#334155' }} className="text-sm font-bold">
                    Active Balance
                  </Text>
                </View>
                <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="text-sm font-black">
                  ₹{Number(holdModalData.active || safeWalletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* On Hold */}
              <View className="flex-row justify-between items-center py-2.5 border-b" style={{ borderBottomColor: isDark ? '#1E1535' : '#EDE9FE' }}>
                <View className="flex-row items-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2" />
                  <Text style={{ color: isDark ? '#E2E8F0' : '#334155' }} className="text-sm font-bold">
                    On Hold
                  </Text>
                </View>
                <Text style={{ color: isDark ? '#FBBF24' : '#D97706' }} className="text-sm font-black">
                  ₹{Number(holdModalData.onHold || safeOnHoldBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Total Balance */}
              <View className="flex-row justify-between items-center py-2.5 border-b" style={{ borderBottomColor: isDark ? '#1E1535' : '#EDE9FE' }}>
                <View className="flex-row items-center">
                  <View className="w-2.5 h-2.5 rounded-full bg-purple-400 mr-2" />
                  <Text style={{ color: isDark ? '#E2E8F0' : '#334155' }} className="text-sm font-bold">
                    Total
                  </Text>
                </View>
                <Text style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="text-sm font-black">
                  ₹{Number(holdModalData.total || safeTotalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* You Need More Highlight */}
              <View className="flex-row justify-between items-center pt-3 mt-1">
                <Text style={{ color: isDark ? '#F43F5E' : '#E11D48' }} className="text-sm font-black uppercase tracking-wide">
                  You Need More
                </Text>
                <Text style={{ color: isDark ? '#F43F5E' : '#E11D48' }} className="text-base font-black">
                  ₹{Number(holdModalData.shortfall || Math.max(0, safeCost - safeWalletBalance)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-2.5">
              <TouchableOpacity
                onPress={() => {
                  setHoldModalVisible(false);
                  setAddFundsVisible(true);
                }}
                className="rounded-2xl overflow-hidden shadow-md"
                style={{ shadowColor: '#9333EA', shadowRadius: 8 }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3.5 items-center justify-center flex-row"
                >
                  <Plus size={18} color="#FFFFFF" strokeWidth={3} className="mr-1.5" />
                  <Text className="text-white font-black text-sm tracking-wide uppercase">
                    + Add ₹{Math.ceil(holdModalData.shortfall || Math.max(0, safeCost - safeWalletBalance))} to Wallet
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setHoldModalVisible(false)}
                style={{ backgroundColor: isDark ? '#1F1735' : '#F1F5F9' }}
                className="py-3 rounded-2xl items-center justify-center"
                activeOpacity={0.7}
              >
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="font-bold text-xs">
                  Adjust Campaign
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Funds Bottom Sheet */}
      <AddFundsBottomSheet
        visible={addFundsVisible}
        requiredAmount={Math.max(safeCost - safeWalletBalance, 0)}
        currentBalance={safeWalletBalance}
        onClose={() => setAddFundsVisible(false)}
        onSuccess={async () => {
          setAddFundsVisible(false);
          const walletRes = await businessService.getWallet().catch(() => ({ success: false }));
          if (walletRes.success) {
            const total = parseFloat(walletRes.total_balance !== undefined ? walletRes.total_balance : (walletRes.wallet_balance || 0));
            const onHold = parseFloat(walletRes.on_hold || 0);
            const active = parseFloat(walletRes.active_balance !== undefined ? walletRes.active_balance : Math.max(0, total - onHold));
            setWalletData({ total, onHold, active });
          }
        }}
      />

    </SafeAreaView>
  );
}