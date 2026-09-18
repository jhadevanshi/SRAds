import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Video, Image as ImageIcon, MapPin, Check, Plus, Calendar, MonitorSmartphone, CheckCircle2, UploadCloud, Trash2, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { businessService } from '../../services/business';
import VideoTrimmer from '../../components/VideoTrimmer';
import AddFundsBottomSheet from '../../components/AddFundsBottomSheet';

const ROUTES = [
  { id: '1', name: 'Bopal Area', brts: 10, screens: 20, area: 'Bopal' },
  { id: '2', name: 'Bapunagar Area', brts: 8, screens: 16, area: 'Bapunagar' },
  { id: '3', name: 'Ranip Area', brts: 12, screens: 24, area: 'Ranip' },
  { id: '4', name: 'Shivranjini Area', brts: 15, screens: 30, area: 'Shivranjini' },
  { id: '5', name: 'SG Highway', brts: 18, screens: 36, area: 'SG Highway' },
  { id: '6', name: 'Navrangpura Area', brts: 14, screens: 28, area: 'Navrangpura' },
];

// Helper to format date as YYYY-MM-DD
const formatDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CreateCampaignScreen({ route, navigation }) {

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
  const [walletBalance, setWalletBalance] = useState(0);

  // New Ad Upload State (Step 1 Inline Upload)
  const [uploadMode, setUploadMode] = useState(false); // true when user is uploading inline
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdMedia, setNewAdMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoTrimmerVisible, setVideoTrimmerVisible] = useState(false);
  const [addFundsVisible, setAddFundsVisible] = useState(false);

  // Where selector mode
  const [whereMode, setWhereMode] = useState('everywhere'); // 'everywhere' | 'specific'

  // Calendar Modal State
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState('start'); // 'start' | 'end'
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());



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
        setWalletBalance(parseFloat(walletRes.wallet_balance || 0));
      }

      // Handle preselected Ad
      if (route.params?.preselectedAdId) {
        const preAd = fetchedAds.find(a => a.id === route.params.preselectedAdId);
        if (preAd) {
          setForm(prev => ({ ...prev, ad: preAd }));
        } else {
          const mockAd = { 
            id: route.params.preselectedAdId, 
            title: route.params.preselectedAdTitle || 'New Uploaded Ad' 
          };
          setForm(prev => ({ ...prev, ad: mockAd }));
          setAds([mockAd, ...fetchedAds]);
        }
      } else if (fetchedAds.length > 0) {
        // Auto-select first ad if available
        setForm(prev => ({ ...prev, ad: fetchedAds[0] }));
      } else {
        // No ads: open upload mode automatically
        setUploadMode(true);
      }

      // Default Everywhere
      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '4')] }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'http://192.168.147.25:5000';

  const pickMedia = async (mediaType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video' ? ['videos'] : ['images'],
      allowsEditing: false, // Turn off native trimmer so we use our custom visual trimmer
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.type === 'video') {
        const durationSec = Math.floor((asset.duration || 0) / 1000);
        setForm(prev => ({ ...prev, trimStart: '0', trimEnd: String(Math.floor(durationSec)) }));
        setNewAdMedia(asset);
        // Open custom visual trimmer
        setVideoTrimmerVisible(true);
      } else {
        setNewAdMedia(asset);
      }
    }
  };

  const handleInlineUpload = async () => {
    if (!newAdTitle || !newAdMedia) {
      Alert.alert('Incomplete', 'Please provide an ad name and media.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newAdTitle);
      formData.append('budget', '0');
      formData.append('cost_per_play', '0'); // Unused
      
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
        // Reload ads library to pick the new ad
        const adsRes = await businessService.getAds();
        let updatedAds = ads;
        if (adsRes.success) {
          updatedAds = adsRes.ads || [];
          setAds(updatedAds);
        }
        
        // Find newly uploaded ad or construct mock
        const newAd = updatedAds.find(a => a.title === newAdTitle) || {
          id: res.ad?.id || Date.now(),
          title: newAdTitle,
          media_type: newAdMedia.type,
          file_url: null
        };

        setForm(prev => ({ ...prev, ad: newAd }));
        setUploadMode(false);
        setNewAdTitle('');
        setNewAdMedia(null);
        Alert.alert('Success', 'Advertisement uploaded and selected.');
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleRoute = (routeItem) => {
    if (form.routes.find(r => r.id === routeItem.id)) {
      // Don't allow empty routes selection
      if (form.routes.length === 1) return;
      setForm({ ...form, routes: form.routes.filter(r => r.id !== routeItem.id) });
    } else {
      setForm({ ...form, routes: [...form.routes, routeItem] });
    }
  };

  const handleWhereModeChange = (mode) => {
    setWhereMode(mode);
    if (mode === 'everywhere') {
      // Select All Ahmedabad Routes
      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '4')] }));
    } else {
      // Select Navrangpura as default specific
      setForm(prev => ({ ...prev, routes: [ROUTES.find(r => r.id === '1')] }));
    }
  };


  const totalSelectedBrts = form.routes.reduce((acc, r) => acc + r.brts, 0);
  const totalSelectedScreens = form.routes.reduce((acc, r) => acc + r.screens, 0);

  const handleNext = () => {
    if (step === 1 && !form.ad) return Alert.alert('Required', 'Please select or upload an advertisement.');
    if (step === 2 && form.routes.length === 0) return Alert.alert('Required', 'Please select at least one route.');
    if (step === 3) {
      if (!startDate || !endDate || !startTime || !endTime) return Alert.alert('Required', 'Please select both date and time ranges.');
      
      const sd = new Date(startDate);
      const ed = new Date(endDate);
      sd.setHours(0, 0, 0, 0);
      ed.setHours(0, 0, 0, 0);
      
      if (ed < sd) return Alert.alert('Invalid Date', 'End date cannot be before start date.');
      
      const startSeconds = startTime.getHours() * 3600 + startTime.getMinutes() * 60;
      const endSeconds = endTime.getHours() * 3600 + endTime.getMinutes() * 60;
      if (endSeconds <= startSeconds) return Alert.alert('Invalid Time', 'End time must be after start time.');
    }
    if (step === 4) {
      if (safeCost > safeWalletBalance) {
        return Alert.alert('Insufficient Balance', 'Your estimated cost exceeds your available wallet balance. Please add funds first.');
      }
      handleLaunch();
      return;
    }
    setStep(step + 1);
  };

  const handleLaunch = async () => {
    setCreating(true);
    try {
      // everywhere uses 'all' targeting, specific uses custom string aggregated
      const selectedAreas = whereMode === 'everywhere' ? 'all' : form.routes.map(r => r.area).join(', ');
      
      const payload = {
        campaign_name: `${form.ad.title} Campaign`,
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
        setStep(6); // Success step
      } else {
        Alert.alert('Error', res.message);
      }
    } catch (err) {
      Alert.alert('Failed', err.response?.data?.message || 'Failed to launch advertisement');
    } finally {
      setCreating(false);
    }
  };

  // Reusable lightweight month grid generator

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
  const safeWalletBalance = Number(walletBalance) || 0;
  const safePlaysPerDay = Number(playsPerDay) || 0;
  const safeTotalPlays = Number(totalPlays) || 0;
  const safeScheduledDays = Number(scheduledDays) || 0;



  const openCalendar = (target) => {
    setCalendarTarget(target);
    if (!isNaN(initialDate.getTime())) {
      setCurrentYear(initialDate.getFullYear());
      setCurrentMonth(initialDate.getMonth());
    }
    setCalendarVisible(true);
  };

  // SUCCESS STEP (Step 6)
  if (step === 6) {
    // Dynamic status support for reusability (currently defaults to pending post-submission)
    const adStatus = 'pending'; // could be 'approved', 'rejected', 'pending'
    const locationsText = whereMode === 'everywhere' ? 'Everywhere' : `${form.routes.length} location${form.routes.length > 1 ? 's' : ''}`;
    
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
        <ScrollView className="flex-1 px-6 pt-10 pb-20">
          
          {/* HERO SECTION */}
          <View className="items-center mb-10">
            {adStatus === 'rejected' ? (
              <View className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4 shadow-sm">
                <Text className="text-red-500 text-3xl">⚠️</Text>
              </View>
            ) : adStatus === 'approved' ? (
              <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4 shadow-sm shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-800/50">
                <Text className="text-emerald-500 text-3xl">🎉</Text>
              </View>
            ) : (
              <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-4 shadow-sm shadow-emerald-500/20 border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
              </View>
            )}

            <Text className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">
              {adStatus === 'rejected' ? 'Ad needs changes' : 
               adStatus === 'approved' ? 'Your ad is approved' : 
               'Your ad is submitted'}
            </Text>
            
            <Text className="text-slate-500 dark:text-slate-400 text-center font-medium leading-relaxed px-4">
              {adStatus === 'rejected' ? `"${form.ad?.title}" could not be approved based on our guidelines. Please edit and resubmit.` : 
               adStatus === 'approved' ? `"${form.ad?.title}" is approved and ready to play on your scheduled dates.` : 
               `"${form.ad?.title}" has been submitted successfully and is waiting for admin approval.`}
            </Text>
          </View>

          {/* STATUS CARD */}
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Text className={`text-lg mr-2 ${adStatus === 'rejected' ? 'text-red-500' : adStatus === 'approved' ? 'text-emerald-500' : 'text-[#F59E0B]'}`}>●</Text>
              <Text className="text-slate-900 dark:text-white font-black tracking-tight uppercase text-sm">
                {adStatus === 'rejected' ? 'Action Required' : 
                 adStatus === 'approved' ? 'Ready to Play' : 
                 'Pending Approval'}
              </Text>
            </View>
            
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
              {adStatus === 'rejected' ? 'Your advertisement requires edits before it can be played.' : 
               adStatus === 'approved' ? 'Your advertisement will automatically play according to schedule.' : 
               'Your advertisement is being reviewed by our administrator.'}
            </Text>

            {/* Timeline */}
            <View className="ml-2">
              <View className="flex-row items-center mb-4">
                <View className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center z-10 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </View>
                <Text className="ml-3 text-slate-700 dark:text-slate-300 font-bold text-sm">Submitted</Text>
              </View>
              
              <View className="absolute left-[9px] top-4 w-[2px] h-10 bg-slate-200 dark:bg-slate-700" />
              
              <View className="flex-row items-center mb-4">
                <View className={`w-5 h-5 rounded-full items-center justify-center z-10 border ${
                  adStatus === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 
                  adStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 
                  'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                }`}>
                  {adStatus === 'approved' ? (
                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                  ) : adStatus === 'rejected' ? (
                    <Text className="text-red-500 font-black text-[10px]">!</Text>
                  ) : (
                    <View className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </View>
                <Text className={`ml-3 font-bold text-sm ${adStatus === 'pending' ? 'text-[#F59E0B]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {adStatus === 'rejected' ? 'Review Failed' : 
                   adStatus === 'approved' ? 'Approved' : 'Under Review'}
                </Text>
              </View>
              
              <View className="absolute left-[9px] top-[52px] w-[2px] h-10 bg-slate-200 dark:bg-slate-700" />
              
              <View className="flex-row items-center">
                <View className={`w-5 h-5 rounded-full items-center justify-center z-10 border ${adStatus === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-[#0D1117] border-slate-300 dark:border-slate-600'}`}>
                  {adStatus === 'approved' && <View className="w-2 h-2 rounded-full bg-emerald-500" />}
                </View>
                <Text className={`ml-3 font-bold text-sm ${adStatus === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>Ready to Play</Text>
              </View>
            </View>
          </View>

          {/* AD DETAILS CARD */}
          <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest mb-3 ml-1">Advertisement Details</Text>
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 mb-8 shadow-sm">
            <View className="flex-row justify-between mb-4 items-center">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Advertisement</Text>
              <Text className="text-slate-900 dark:text-white font-black text-[14px]">{form.ad?.title}</Text>
            </View>
            
            <View className="flex-row justify-between mb-4 items-center">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Locations</Text>
              <Text className="text-slate-900 dark:text-white font-black text-[14px]">{locationsText}</Text>
            </View>
            
            <View className="flex-row justify-between mb-5">
              <Text className="text-slate-500 dark:text-slate-400 font-bold text-[13px]">Schedule</Text>
              <View className="items-end">
                <Text className="text-slate-900 dark:text-white font-black text-[14px]">{formatDate(startDate)} →</Text>
                <Text className="text-slate-900 dark:text-white font-black text-[14px]">{formatDate(endDate)}</Text>
              </View>
            </View>
            
            <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-5" />
            
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-600 dark:text-slate-300 font-black text-[13px]">Estimated ad cost</Text>
              <Text className="text-slate-900 dark:text-white font-black text-lg">₹{safeCost.toFixed(2)}</Text>
            </View>
          </View>

          {/* WHAT HAPPENS NEXT */}
          {adStatus === 'pending' && (
            <View className="mb-10 px-1">
              <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest mb-4">What happens next?</Text>
              
              <View className="flex-row items-start mb-3">
                <CheckCircle2 size={16} className="text-emerald-500 mr-3 mt-0.5" />
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Your ad has been submitted</Text>
              </View>
              
              <View className="flex-row items-start mb-3">
                <Text className="text-amber-500 mr-3 text-sm mt-0.5">●</Text>
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Our administrator reviews it</Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 mr-3 mt-0.5" />
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-sm flex-1">Once approved, it starts playing automatically</Text>
              </View>
            </View>
          )}

          {/* BUTTONS */}
          <View className="gap-3 pb-8">
            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'My Ads' })}
              className="w-full bg-[#F59E0B] py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-amber-500/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-black text-base tracking-tight">
                {adStatus === 'rejected' ? 'Edit Ad Details →' : 'View Ad Details →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              className="w-full bg-white dark:bg-[#161B22] py-4 rounded-2xl items-center border border-slate-200 dark:border-[#30363D]"
              activeOpacity={0.8}
            >
              <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm tracking-tight">Go to Home</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} 
            className="bg-slate-50 dark:bg-[#161B22] p-2 rounded-full border border-slate-200 dark:border-[#30363D] mr-3"
          >
            <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Launch Your Ad</Text>
        </View>
      </View>

      {/* Modern Segmented Stepper */}
      <View className="px-4 py-4 bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-[#1F2937]">
        <View className="flex-row justify-between">
          {['Ad', 'Where', 'Schedule', 'Review'].map((label, idx) => (
            <View key={label} className="flex-1 px-1">
              <View className={`h-1 rounded-full w-full mb-2 ${step >= idx + 1 ? 'bg-[#F59E0B]' : 'bg-slate-100 dark:bg-[#30363D]'}`} />
              <Text className={`text-[10px] font-black uppercase text-center ${step >= idx + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#8B949E]'}`}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* STEP 1: ADVERTISEMENT */}
        {step === 1 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Choose your advertisement</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Select the image or video you want to display on BRT screens.</Text>

            {uploadMode ? (
              // Inline Upload Form
              <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 shadow-sm mb-6">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-slate-900 dark:text-white font-black text-base">Upload New Creative</Text>
                  <TouchableOpacity onPress={() => setUploadMode(false)} className="p-1 rounded-full bg-slate-100 dark:bg-[#30363D]">
                    <X size={16} className="text-slate-500" />
                  </TouchableOpacity>
                </View>

                {!newAdMedia ? (
                  <View className="flex-row space-x-3 mb-5">
                    <TouchableOpacity 
                      onPress={() => pickMedia('image')}
                      className="flex-1 bg-slate-50 dark:bg-[#0D1117] py-6 rounded-2xl items-center border border-slate-200 dark:border-[#30363D]"
                    >
                      <ImageIcon size={24} className="text-amber-500 mb-2" />
                      <Text className="text-slate-800 dark:text-slate-200 font-bold text-xs">Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => pickMedia('video')}
                      className="flex-1 bg-slate-50 dark:bg-[#0D1117] py-6 rounded-2xl items-center border border-slate-200 dark:border-[#30363D]"
                    >
                      <Video size={24} className="text-sky-500 mb-2" />
                      <Text className="text-slate-800 dark:text-slate-200 font-bold text-xs">Video</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mb-5">
                    <View className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#30363D] mb-3">
                      {newAdMedia.type === 'video' ? (
                        <View className="w-full h-full bg-slate-950 items-center justify-center">
                          <Video size={36} className="text-sky-500 mb-2" />
                          <Text className="text-slate-400 text-xs font-bold">{newAdMedia.fileName || 'Video selected'}</Text>
                        </View>
                      ) : (
                        <Image source={{ uri: newAdMedia.uri }} className="w-full h-full" resizeMode="cover" />
                      )}
                      <TouchableOpacity onPress={() => setNewAdMedia(null)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                        <Trash2 size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {newAdMedia.type === 'video' && (
                      <View className="bg-slate-50 dark:bg-[#0D1117] p-4 rounded-xl border border-slate-200 dark:border-[#30363D] flex-row justify-between items-center">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mr-3">
                            <Check size={20} className="text-emerald-500" />
                          </View>
                          <View>
                            <Text className="text-slate-900 dark:text-white font-black text-sm">Video Ready</Text>
                            <Text className="text-slate-500 font-bold text-xs mt-0.5">Duration: {parseInt(form.trimEnd) - parseInt(form.trimStart) || 0} sec</Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          onPress={() => setVideoTrimmerVisible(true)}
                          className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] px-4 py-2 rounded-lg shadow-sm"
                        >
                          <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs">Edit Trim</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-widest mb-2">Creative Name</Text>
                <TextInput
                  value={newAdTitle}
                  onChangeText={setNewAdTitle}
                  placeholder="e.g. Summer Promo 2026"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold mb-5"
                />

                <TouchableOpacity 
                  onPress={handleInlineUpload}
                  disabled={uploading || !newAdTitle || !newAdMedia}
                  className={`py-3.5 rounded-full items-center flex-row justify-center ${uploading || !newAdTitle || !newAdMedia ? 'bg-slate-200 dark:bg-[#30363D]' : 'bg-[#F59E0B] shadow-md shadow-amber-500/20'}`}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <UploadCloud size={16} color="#FFF" />
                      <Text className="text-white font-black ml-2">Upload & Select</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-6">
                <TouchableOpacity 
                  onPress={() => setUploadMode(true)}
                  className="bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700/50 rounded-3xl p-6 items-center justify-center mb-6"
                >
                  <View className="w-12 h-12 bg-white dark:bg-[#161B22] rounded-full items-center justify-center shadow-sm mb-3">
                    <Plus size={24} className="text-amber-500" />
                  </View>
                  <Text className="text-amber-700 dark:text-amber-400 font-bold mb-1">Upload New Ad</Text>
                  <Text className="text-amber-600/70 dark:text-amber-500/70 text-xs">Supported: JPG, PNG, MP4 (Any length)</Text>
                </TouchableOpacity>
              </View>
            )}

            {ads.length > 0 && !uploadMode && (
              <View>
                <Text className="text-xs font-black text-slate-400 dark:text-[#8B949E] uppercase tracking-widest mb-4">Or choose from your library</Text>
                <View className="flex-row flex-wrap justify-between">
                  {ads.map(ad => {
                    const isSelected = form.ad?.id === ad.id;
                    const isVideo = ad.media_type === 'video';
                    return (
                      <TouchableOpacity 
                        key={ad.id} 
                        onPress={() => setForm({ ...form, ad })}
                        className={`w-[48%] h-48 rounded-2xl mb-4 overflow-hidden border-2 ${isSelected ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-200 dark:border-[#30363D]'}`}
                      >
                        {ad.file_url ? (
                          <Image source={{ uri: `${getBaseUrl().replace('/api', '')}${ad.file_url}` }} className="w-full h-full opacity-90" resizeMode="cover" />
                        ) : (
                          <View className="w-full h-full bg-slate-100 dark:bg-[#161B22] items-center justify-center">
                            {isVideo ? <Video size={32} color="#94A3B8" /> : <ImageIcon size={32} color="#94A3B8" />}
                          </View>
                        )}
                        <View className="absolute inset-0 bg-black/20" />
                        
                        <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md max-w-[85%]">
                          <Text className="text-white text-[10px] font-bold" numberOfLines={1}>{ad.title}</Text>
                        </View>
                        
                        {isSelected && (
                          <View className="absolute top-2 right-2 bg-amber-500 w-6 h-6 rounded-full items-center justify-center">
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
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Where should your ad play?</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Choose whether to stream wide or target select routes.</Text>

            {/* Anywhere vs Specific Selector */}
            <View className="flex-row space-x-3 mb-6">
              <TouchableOpacity 
                onPress={() => handleWhereModeChange('everywhere')}
                className={`flex-1 p-5 rounded-3xl border-2 bg-white dark:bg-[#161B22] ${whereMode === 'everywhere' ? 'border-[#F59E0B]' : 'border-slate-200 dark:border-[#30363D]'}`}
              >
                <Text className="text-slate-900 dark:text-white font-black text-base mb-1">Everywhere</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Play your advertisement across the available display network.</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleWhereModeChange('specific')}
                className={`flex-1 p-5 rounded-3xl border-2 bg-white dark:bg-[#161B22] ${whereMode === 'specific' ? 'border-[#F59E0B]' : 'border-slate-200 dark:border-[#30363D]'}`}
              >
                <Text className="text-slate-900 dark:text-white font-black text-base mb-1">Specific Location</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Choose specific routes where you want your ad to appear.</Text>
              </TouchableOpacity>
            </View>

            {/* Reach Summary */}
            <View className="bg-slate-900 rounded-2xl p-4 mb-6 flex-row justify-between items-center shadow-md">
              <View>
          <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Target Audience Reach</Text>
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-xl">{totalSelectedScreens} Screens</Text>
                  <Text className="text-slate-400 font-bold ml-2">across {totalSelectedBrts} BRTs</Text>
                </View>
              </View>

            </View>
            {whereMode === 'specific' && ROUTES.map(routeItem => {
              const isSelected = form.routes.find(r => r.id === routeItem.id);
              return (
                <TouchableOpacity 
                  key={routeItem.id}
                  onPress={() => toggleRoute(routeItem)}
                  className={`bg-white dark:bg-[#161B22] border-2 rounded-2xl p-4 mb-3 flex-row justify-between items-center ${isSelected ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-900/10' : 'border-slate-200 dark:border-[#30363D]'}`}
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${isSelected ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-[#30363D]'}`}>
                      <MapPin size={24} className={isSelected ? 'text-amber-500' : 'text-slate-400'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight mb-0.5">{routeItem.name}</Text>
                      <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold">{routeItem.brts} BRTs • {routeItem.screens} Screens</Text>
                    </View>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 3: SCHEDULE */}
        {step === 3 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">WHEN SHOULD YOUR AD PLAY?</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Select the scheduling range for displaying your advertisement.</Text>

            <View className="flex-row justify-between mb-2 px-1">
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1">Start Date</Text>
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1 ml-4">End Date</Text>
            </View>
            
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity 
                onPress={() => openPicker('startDate')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Calendar size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              <View className="w-4" />
              
              <TouchableOpacity 
                onPress={() => openPicker('endDate')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Calendar size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Daily Time Slot</Text>
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity 
                onPress={() => openPicker('startTime')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Clock size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatTime(startTime)}</Text>
              </TouchableOpacity>
              
              <Text className="text-slate-400 mx-3 font-bold">→</Text>
              
              <TouchableOpacity 
                onPress={() => openPicker('endTime')}
                className="flex-row items-center bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-xl p-3 flex-1 shadow-sm"
              >
                <Clock size={18} className="text-slate-400 mr-2" />
                <Text className="text-slate-900 dark:text-white font-bold">{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>

            {(startDate && endDate && startTime && endTime) && (
              <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 mb-4">
                <Text className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">Your Ad Schedule</Text>
                
                <View className="flex-row items-center mb-3">
                  <Calendar size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    {formatDate(startDate)} → {formatDate(endDate)}
                  </Text>
                </View>
                
                <View className="flex-row items-center mb-3">
                  <Clock size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    Every day, {formatTime(startTime)} → {formatTime(endTime)}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <CheckCircle2 size={16} className="text-amber-500 mr-3" />
                  <Text className="text-amber-800 dark:text-amber-100 font-bold">
                    {safeScheduledDays} days · {Math.floor(dailySlotSeconds / 3600)} hr {Math.floor((dailySlotSeconds % 3600) / 60)} min/day
                  </Text>
                </View>
              </View>
            )}

            {/* Render Native Pickers */}
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

                {/* STEP 4: REVIEW & ESTIMATED COST */}
        {step === 4 && (
          <View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Review & Launch</Text>
            <Text className="text-slate-500 dark:text-[#8B949E] mb-6">Review your schedule and estimated maximum cost.</Text>

            {/* CARD 1: SUMMARY */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ad Summary</Text>
              
              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Creative</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4" numberOfLines={1}>{form.ad?.title}</Text>
              </View>
              
              <View className="flex-row justify-between mb-4 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Type & Duration</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{form.ad?.media_type === 'video' ? 'Video Ad' : 'Image Ad'} • {safeDuration}s</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />

              <View className="flex-row justify-between mb-4 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Target Location</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{whereMode === 'everywhere' ? 'Everywhere' : `${form.routes.length} Selected Routes`}</Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />

              <View className="flex-row justify-between mb-3 items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Date Range</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{formatDate(startDate)} → {formatDate(endDate)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[13px] text-slate-500 font-bold">Daily Time Slot</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black text-right flex-1 ml-4">{formatTime(startTime)} → {formatTime(endTime)}</Text>
              </View>
            </View>

            {/* CARD 2: COST & BALANCE BREAKDOWN */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 mb-5 shadow-sm">
              <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Cost Breakdown</Text>
              
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Active Days</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeScheduledDays}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Plays per Day</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safePlaysPerDay}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-[13px] text-slate-500 font-bold">Total Est. Plays</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">{safeTotalPlays}</Text>
              </View>

              <View className="bg-[#F8FAFC] dark:bg-[#0D1117] border border-slate-100 dark:border-[#1F2937] rounded-xl p-4 flex-row justify-between items-center mb-5 shadow-sm">
                <Text className="text-[13px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wide">Max Est. Cost</Text>
                <Text className="text-[20px] text-[#F59E0B] font-black">₹{safeCost.toFixed(2)}</Text>
              </View>
              
              {/* Disclaimer Callout */}
              <View className="bg-blue-50/80 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3 flex-row mb-5 items-start shadow-sm">
                <Text className="text-blue-500 mr-2 mt-0.5 text-sm">ℹ️</Text>
                <Text className="flex-1 text-[12px] text-blue-700 dark:text-blue-300 font-semibold leading-relaxed">
                  Actual deductions occur incrementally based on verified playbacks. This is the maximum expected cost.
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-5" />

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[13px] text-slate-500 font-bold">Current Wallet Balance</Text>
                <Text className="text-[15px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
              </View>
              
              {safeCost > safeWalletBalance ? (
                <View className="flex-row justify-between items-center">
                  <Text className="text-[13px] text-red-500 font-black">Additional Funds Required</Text>
                  <Text className="text-[16px] font-black text-red-500">
                    ₹{(safeCost - safeWalletBalance).toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-between items-center">
                  <Text className="text-[13px] text-slate-900 dark:text-white font-black">Balance After Launch</Text>
                  <Text className="text-[16px] font-black text-emerald-500">
                    ₹{(safeWalletBalance - safeCost).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
            
            {safeCost > safeWalletBalance ? (
              <View className="mt-2 bg-white dark:bg-[#161B22] border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-5 mb-5 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <Text className="text-red-500 mr-2 text-lg">⚠️</Text>
                  <Text className="text-slate-900 dark:text-white font-black text-base">Additional funds required</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[13px] text-slate-500 font-bold">Estimated Cost</Text>
                  <Text className="text-[14px] text-slate-900 dark:text-white font-black">₹{safeCost.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-4">
                  <Text className="text-[13px] text-slate-500 font-bold">Wallet Balance</Text>
                  <Text className="text-[14px] text-slate-900 dark:text-white font-black">₹{safeWalletBalance.toFixed(2)}</Text>
                </View>
                
                <View className="h-px bg-slate-100 dark:bg-[#30363D] w-full mb-4" />
                
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-[13px] text-red-500 font-black">Required</Text>
                  <Text className="text-[16px] text-red-500 font-black">₹{(safeCost - safeWalletBalance).toFixed(2)}</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => setAddFundsVisible(true)}
                  className="bg-[#F59E0B] py-3.5 rounded-xl w-full flex-row justify-center items-center shadow-md shadow-amber-500/20"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-black text-sm tracking-tight">+ Add Funds</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mt-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-2xl p-4 mb-5 flex-row items-center">
                <CheckCircle2 size={20} className="text-emerald-500 mr-3" />
                <Text className="text-emerald-700 dark:text-emerald-400 font-black text-sm flex-1">
                  ✓ Wallet balance is sufficient
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="px-5 pt-4 pb-8 border-t border-slate-100 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] flex-row">
        {step === 4 ? (
          <TouchableOpacity 
            onPress={handleLaunch} 
            disabled={creating || safeCost > safeWalletBalance}
            className={`flex-1 ${creating || safeCost > safeWalletBalance ? 'bg-slate-200 dark:bg-slate-700' : 'bg-[#0F172A] dark:bg-slate-800'} py-4 rounded-full flex-row items-center justify-center shadow-md`}
          >
            {creating ? <ActivityIndicator color="#FFFFFF" className="mr-2" /> : null}
            <Text className={`font-black text-lg tracking-tight ${creating || safeCost > safeWalletBalance ? 'text-slate-400' : 'text-white'}`}>
              {creating ? 'Launching...' : (safeCost > safeWalletBalance ? 'Confirm & Launch Ad' : '🚀 Confirm & Launch Ad')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={handleNext} 
            disabled={uploadMode && uploading}
            className="flex-1 bg-[#F59E0B] py-4 rounded-full items-center shadow-md shadow-amber-500/30"
          >
            <Text className="text-white font-black text-lg tracking-tight">Next Step</Text>
          </TouchableOpacity>
        )}
      </View>

    
      <Modal visible={videoTrimmerVisible} animationType="slide" onRequestClose={() => setVideoTrimmerVisible(false)}>
        {newAdMedia && newAdMedia.type === 'video' && (
          <VideoTrimmer 
            uri={newAdMedia.uri} 
            originalDurationSec={Math.floor((newAdMedia.duration || 0) / 1000)}
            onSave={(trimData) => {
              if (trimData.start >= trimData.end) {
                Alert.alert('Invalid Trim', 'Start time must be less than end time.');
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

    
      <AddFundsBottomSheet
        visible={addFundsVisible}
        requiredAmount={Math.max(safeCost - safeWalletBalance, 0)}
        currentBalance={safeWalletBalance}
        onClose={() => setAddFundsVisible(false)}
        onSuccess={async () => {
          setAddFundsVisible(false);
          // Refresh the wallet balance so the Launch button unlocks instantly
          const walletRes = await businessService.getWallet().catch(() => ({ success: false }));
          if (walletRes.success) {
            setWalletBalance(parseFloat(walletRes.wallet_balance || 0));
          }
        }}
      />

    </SafeAreaView>
  );
}