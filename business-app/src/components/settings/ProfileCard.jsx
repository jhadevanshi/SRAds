import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, BadgeCheck } from 'lucide-react-native';

export default function ProfileCard({ name, businessId, onPress }) {
  return (
    <View className="mb-8 mt-2">
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onPress}
        className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-slate-100 dark:border-[#30363D] shadow-sm flex-row items-center"
      >
        <View className="w-16 h-16 bg-slate-100 dark:bg-[#0D1117] rounded-full mr-4 border-2 border-slate-200 dark:border-[#30363D] overflow-hidden items-center justify-center">
           <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80' }} 
              className="w-full h-full"
            />
        </View>
        <View className="flex-1 justify-center">
          <View className="flex-row items-center mb-1">
            <Text className="text-xl font-black text-slate-900 dark:text-white mr-1 tracking-tight" numberOfLines={1}>{name}</Text>
            <BadgeCheck size={16} className="text-blue-500" />
          </View>
          <Text className="text-slate-500 dark:text-[#8B949E] text-sm font-bold">Account #{businessId}</Text>
        </View>
        <View className="bg-slate-50 dark:bg-[#0D1117] px-3 py-1.5 rounded-full flex-row items-center ml-2 border border-slate-100 dark:border-[#30363D]">
          <Text className="text-slate-600 dark:text-[#8B949E] text-xs font-bold mr-1">Edit</Text>
          <ChevronRight size={14} className="text-slate-400 dark:text-[#8B949E]" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
