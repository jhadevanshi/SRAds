import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, BadgeCheck, Sparkles, Building2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileCard({ name, businessId, onPress }) {
  const { isDark } = useTheme();

  return (
    <View className="mb-6 mt-1">
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={onPress}
        style={{ 
          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
          borderColor: isDark ? '#281B4B' : '#EDE9FE',
          shadowColor: isDark ? '#7C3AED' : '#9333EA',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.2 : 0.08,
          shadowRadius: 8,
          elevation: 3
        }}
        className="rounded-3xl p-5 border flex-row items-center"
      >
        <LinearGradient
          colors={['#7C3AED', '#9333EA', '#C084FC']}
          className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm"
        >
          <Building2 size={26} color="#FFFFFF" />
        </LinearGradient>

        <View className="flex-1 justify-center">
          <View className="flex-row items-center mb-0.5">
            <Text 
              style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }}
              className="text-lg font-black mr-1.5 tracking-tight" 
              numberOfLines={1}
            >
              {name}
            </Text>
            <BadgeCheck size={16} color="#A855F7" />
          </View>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold">
            Account #{businessId} · Verified Merchant
          </Text>
        </View>

        <View 
          style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
          className="px-3 py-1.5 rounded-full flex-row items-center ml-2"
        >
          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-bold mr-1">Edit</Text>
          <ChevronRight size={13} color={isDark ? '#C084FC' : '#7C3AED'} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
