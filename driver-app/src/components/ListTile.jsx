import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export default function ListTile({ icon: Icon, title, subtitle, onPress, color = '#64748B', danger = false }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-slate-100 last:border-0"
    >
      {Icon && (
        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4">
          <Icon size={20} color={danger ? '#EF4444' : color} />
        </View>
      )}
      <View className="flex-1">
        <Text className={`text-base font-bold ${danger ? 'text-red-500' : 'text-slate-800'}`}>{title}</Text>
        {subtitle && <Text className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );
}
