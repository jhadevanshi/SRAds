import React from 'react';
import { Text, View } from 'react-native';

export default function SectionHeader({ title, subtitle }) {
  return (
    <View className="mb-4 mt-2">
      <Text className="text-lg font-bold text-slate-900 tracking-tight">{title}</Text>
      {subtitle && <Text className="text-sm text-slate-500">{subtitle}</Text>}
    </View>
  );
}
