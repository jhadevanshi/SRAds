import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsCard({ title, children, noPadding = false }) {
  const { isDark } = useTheme();

  return (
    <View className="mb-5">
      {title && (
        <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[11px] font-black uppercase tracking-widest mb-2.5 ml-2">
          {title}
        </Text>
      )}
      <View 
        style={{ 
          backgroundColor: isDark ? '#140F24' : '#FFFFFF',
          borderColor: isDark ? '#281B4B' : '#EDE9FE',
          shadowColor: isDark ? '#7C3AED' : '#9333EA',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.15 : 0.05,
          shadowRadius: 6,
          elevation: 2
        }}
        className={`rounded-3xl border overflow-hidden ${!noPadding ? 'p-1.5' : ''}`}
      >
        {children}
      </View>
    </View>
  );
}
