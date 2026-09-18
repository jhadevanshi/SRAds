import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { businessService } from '../../services/business';
import { ArrowLeft, UploadCloud, FileVideo, Image as ImageIcon, CheckCircle2, Megaphone, Trash2 } from 'lucide-react-native';
import VideoTrimmer from '../../components/VideoTrimmer';

export default function UploadAdScreen({ navigation }) {
  const [form, setForm] = useState({ title: '' });
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedAd, setUploadedAd] = useState(null); // stores the result from backend on success
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimData, setTrimData] = useState(null);

  const pickMedia = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'video' ? ['videos'] : ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      
      // Validate Video duration
      if (asset.type === 'video') {
        const durationSec = (asset.duration || 0) / 1000;
        if (durationSec > 60) {
          Alert.alert('Invalid Video', 'Video duration must be 60 seconds or less.');
          return;
        }
      }
      setMedia(asset);
    }
  };

  const handleUpload = async () => {
    if (!form.title || !media) {
      Alert.alert('Incomplete', 'Please provide a title and select media.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      // Passing 0 since budget is handled at the campaign level in the new UX
      formData.append('budget', '0'); 
      formData.append('cost_per_play', media.type === 'video' ? '2' : '1');
      
      // Append file
      formData.append('media', {
        uri: media.uri,
        name: media.fileName || `upload.${media.uri.split('.').pop()}`,
        type: media.mimeType || (media.type === 'video' ? 'video/mp4' : 'image/jpeg')
      });

      const res = await businessService.uploadAd(formData);
      if (res.success) {
        // Assume backend returns ad details or we mock it for the flow
        // The current backend doesn't return the full ad object cleanly in the response as per our last check, but we can pass the title/media forward.
        setUploadedAd({
          id: res.ad?.id || null, // Best effort based on what the API returns
          title: form.title,
          type: media.type,
          uri: media.uri
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
        originalDurationSec={(media.duration || 0) / 1000}
        onSave={(data) => {
          setTrimData(data);
          setShowTrimmer(false);
        }}
        onCancel={() => {
          setShowTrimmer(false);
          setMedia(null);
        }}
      />
    );
  }

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
        <View className="flex-1 items-center justify-center p-6">
          
          <View className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mb-8">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </View>
          
          <Text className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center mb-3">Your ad is ready 🎉</Text>
          <Text className="text-slate-500 dark:text-[#8B949E] text-center text-base mb-10 px-4">
            Your advertisement "{uploadedAd?.title}" has been uploaded successfully.
          </Text>

          <View className="w-full bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-6 mb-10 shadow-sm">
            <Text className="text-slate-900 dark:text-white font-black text-lg text-center mb-4">Ready to put your ad on BRT screens?</Text>
            
            <TouchableOpacity 
              onPress={() => {
                setShowSuccess(false);
                navigation.replace('CreateCampaign', { preselectedAdId: uploadedAd?.id, preselectedAdTitle: uploadedAd?.title });
              }}
              className="bg-[#F59E0B] py-4 rounded-full flex-row items-center justify-center shadow-md shadow-amber-500/20 mb-4"
            >
              <Megaphone size={20} color="#FFF" />
              <Text className="text-white font-black text-base ml-2">Launch Ad</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
              className="bg-slate-100 dark:bg-[#30363D] py-4 rounded-full flex-row items-center justify-center"
            >
              <Text className="text-slate-700 dark:text-white font-bold text-base">Save for Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 -ml-2 rounded-full">
          <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upload Advertisement</Text>
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Add creative for BRT screens</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-8 pb-10">
        
        {/* Step 1: Media */}
        <View className="mb-8">
          <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">1. Choose your creative</Text>
          
          {!media ? (
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="flex-1 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-6 items-center shadow-sm"
                onPress={() => pickMedia('image')}
              >
                <View className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-3">
                  <ImageIcon size={28} className="text-amber-500" />
                </View>
                <Text className="text-slate-900 dark:text-white font-bold mb-1">Image Ad</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] uppercase tracking-widest font-black">JPEG, PNG</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-1 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-6 items-center shadow-sm"
                onPress={() => pickMedia('video')}
              >
                <View className="w-14 h-14 bg-sky-50 dark:bg-sky-900/20 rounded-full items-center justify-center mb-3">
                  <FileVideo size={28} className="text-sky-500" />
                </View>
                <Text className="text-slate-900 dark:text-white font-bold mb-1">Video Ad</Text>
                <Text className="text-slate-500 dark:text-[#8B949E] text-[10px] uppercase tracking-widest font-black">Max 60 Seconds</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl overflow-hidden shadow-sm">
              {media.type === 'video' ? (
                <View className="bg-slate-900 h-56 justify-center items-center">
                  <FileVideo size={48} className="text-sky-500 mb-3" />
                  <Text className="text-white font-bold text-lg">Video Selected</Text>
                  <Text className="text-slate-400 text-sm mt-1">{media.fileName || 'Creative.mp4'}</Text>
                </View>
              ) : (
                <Image source={{ uri: media.uri }} className="w-full h-56 resize-cover" />
              )}
              <TouchableOpacity 
                onPress={() => setMedia(null)}
                className="absolute top-4 right-4 bg-black/60 p-2.5 rounded-full"
              >
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Step 2: Details */}
        <View className="mb-10">
          <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">2. Give it a name</Text>
          <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-3xl p-5 shadow-sm">
            <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-widest mb-3">Advertisement Name</Text>
            <TextInput
              className="bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-white border border-slate-100 dark:border-[#30363D] rounded-2xl px-5 py-4 text-base font-semibold"
              placeholder="e.g. Summer Sale 2026"
              placeholderTextColor="#8B949E"
              value={form.title}
              onChangeText={(t) => setForm({...form, title: t})}
            />
          </View>
        </View>

        <TouchableOpacity 
          className={`rounded-full py-4 items-center flex-row justify-center mb-10 shadow-md ${(!form.title || !media || loading) ? 'bg-slate-300 dark:bg-[#30363D] shadow-none' : 'bg-[#F59E0B] shadow-amber-500/30'}`}
          onPress={handleUpload}
          disabled={!form.title || !media || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <UploadCloud size={20} color={(!form.title || !media) ? '#94A3B8' : '#FFFFFF'} strokeWidth={3} />
              <Text className={`font-black text-base ml-2 ${(!form.title || !media) ? 'text-slate-500' : 'text-white'}`}>
                Upload Advertisement
              </Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
