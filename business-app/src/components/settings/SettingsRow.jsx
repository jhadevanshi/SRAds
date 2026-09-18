import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsRow({ icon: Icon, title, subtitle, rightContent, onPress, isDestructive, hideBorder, disabled = false }) {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={onPress && !disabled ? 0.7 : 1}
      onPress={!disabled ? onPress : undefined}
      className={`flex-row items-center p-4 ${!hideBorder ? 'border-b border-slate-100 dark:border-[#30363D]' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      {Icon && (
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDestructive ? 'bg-red-50 dark:bg-red-500/10' : 'bg-slate-50 dark:bg-[#0D1117]'}`}>
          <Icon size={20} color={isDestructive ? '#EF4444' : (isDarkMode ? '#8B949E' : '#64748B')} />
        </View>
      )}
      <View className="flex-1 mr-2">
        <Text className={`font-bold text-base ${isDestructive ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{title}</Text>
        {subtitle && <Text className="text-slate-500 dark:text-[#8B949E] text-xs mt-0.5">{subtitle}</Text>}
      </View>
      {rightContent ? (
        rightContent
      ) : (
        onPress && <ChevronRight size={20} className="text-slate-300 dark:text-[#8B949E]" />
      )}
    </TouchableOpacity>
  );
}
