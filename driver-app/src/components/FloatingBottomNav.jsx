import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { LayoutDashboard, History, PieChart, User, Activity } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function FloatingBottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentName = route.name;

  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'TripsHistory', icon: History },
    { name: 'Analytics', icon: PieChart },
    { name: 'AdvertisementHistory', icon: Activity },
    { name: 'Profile', icon: User },
  ];

  return (
    <View className="absolute bottom-6 left-5 right-5 h-16 bg-white/95 rounded-full flex-row items-center justify-between px-6 shadow-xl shadow-slate-900/10 border border-slate-100/50">
      {tabs.map((tab) => {
        const isActive = currentName === tab.name;
        return (
          <TouchableOpacity 
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            className="items-center justify-center p-2"
          >
            <tab.icon 
              size={24} 
              color={isActive ? '#0F172A' : '#94A3B8'} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            {isActive && (
              <View className="w-1 h-1 bg-slate-900 rounded-full mt-1 absolute -bottom-1" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
