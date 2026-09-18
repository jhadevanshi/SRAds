import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default function ActionCard({ icon: Icon, title, onPress, color, bgColor }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="w-[31%] bg-white rounded-3xl p-4 items-center justify-center shadow-sm border border-slate-100 mb-3"
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${bgColor}`}>
        <Icon size={22} color={color} />
      </View>
      <Text className="text-xs font-bold text-slate-700 text-center">{title}</Text>
    </TouchableOpacity>
  );
}
