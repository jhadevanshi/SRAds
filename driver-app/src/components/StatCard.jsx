import React from 'react';
import { View, Text } from 'react-native';

export default function StatCard({ icon: Icon, title, value, subtitle, color, bgColor }) {
  return (
    <View className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex-1 min-w-[140px] mr-4">
      <View className={`w-10 h-10 rounded-2xl items-center justify-center mb-3 ${bgColor}`}>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</Text>
      <Text className="text-slate-900 text-2xl font-black">{value}</Text>
      {subtitle && <Text className="text-slate-400 text-xs font-bold mt-1">{subtitle}</Text>}
    </View>
  );
}
