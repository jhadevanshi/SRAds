import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, Edit3, LogOut, Star, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import FloatingBottomNav from '../components/FloatingBottomNav';
import ListTile from '../components/ListTile';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen(props) {
  const navigation = props.navigation || useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const fetchProfile = async () => {
    try {
      const res = await api.get('/driver/profile');
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  const handlePickImage = async () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) uploadImage(result.assets[0].uri);
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) uploadImage(result.assets[0].uri);
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', {
        uri,
        name: `photo.jpg`,
        type: 'image/jpeg',
      });
      const res = await api.post('/driver/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        Alert.alert("Success", "Profile photo updated");
        fetchProfile();
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 bg-white shadow-sm z-10 border-b border-slate-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900 tracking-tight">Profile</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AccountSettings')}
          className="bg-slate-100 px-4 py-2 rounded-full"
        >
          <Text className="text-slate-900 font-bold text-xs">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handlePickImage} className="w-24 h-24 bg-slate-200 rounded-full items-center justify-center border-4 border-white shadow-sm overflow-hidden mb-4 relative">
            {profile?.profile_photo ? (
              <Image source={{ uri: `${api.defaults.baseURL.replace('/api', '')}${profile.profile_photo}` }} className="w-full h-full" />
            ) : (
              <User color="#64748B" size={48} />
            )}
            <View className="absolute bottom-0 right-0 bg-slate-900 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Camera size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text className="text-2xl font-black text-slate-900">{profile?.name}</Text>
          <Text className="text-slate-500 font-bold mt-1">ID: {profile?.id}</Text>
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Personal Details</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile 
            icon={Phone} 
            title={profile?.phone} 
            subtitle="Verified Mobile Number" 
            onPress={() => navigation.navigate('AccountSettings')} 
          />
          <ListTile 
            icon={Mail} 
            title={profile?.email || 'No email registered'} 
            subtitle="Email Address" 
            onPress={() => navigation.navigate('AccountSettings')} 
          />
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Account Actions</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={LogOut} title="Sign Out" danger={true} onPress={logout} />
        </View>
        
      </ScrollView>
      <FloatingBottomNav />
    </SafeAreaView>
  );
}
