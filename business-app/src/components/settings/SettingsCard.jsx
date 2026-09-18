import React from 'react';
import { View, Text } from 'react-native';

export default function SettingsCard({ title, children, noPadding = false }) {
  return (
    <View className="mb-6">
      {title && (
        <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold uppercase tracking-widest mb-3 ml-2">
          {title}
        </Text>
      )}
      <View className={`bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-[#30363D] overflow-hidden shadow-sm ${!noPadding ? 'p-2' : ''}`}>
        {children}
      </View>
    </View>
  );
}
