import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsRow({ icon: Icon, title, subtitle, rightContent, onPress, isDestructive, hideBorder, disabled = false }) {
  const { isDark } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={onPress && !disabled ? 0.7 : 1}
      onPress={!disabled ? onPress : undefined}
      style={{ 
        borderBottomColor: !hideBorder ? (isDark ? '#281B4B' : '#F1F5F9') : 'transparent',
        borderBottomWidth: !hideBorder ? 1 : 0 
      }}
      className={`flex-row items-center p-3.5 ${disabled ? 'opacity-50' : ''}`}
    >
      {Icon && (
        <View 
          style={{ 
            backgroundColor: isDestructive 
              ? (isDark ? '#2B1218' : '#FFF1F2') 
              : (isDark ? '#1F1735' : '#EDE9FE') 
          }}
          className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
        >
          <Icon size={18} color={isDestructive ? '#F43F5E' : (isDark ? '#C084FC' : '#7C3AED')} />
        </View>
      )}
      <View className="flex-1 mr-2">
        <Text 
          style={{ color: isDestructive ? '#F43F5E' : (isDark ? '#F8FAFC' : '#1E1B4B') }}
          className="font-extrabold text-sm"
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs mt-0.5 font-medium">
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent ? (
        rightContent
      ) : (
        onPress && <ChevronRight size={16} color={isDark ? '#64748B' : '#94A3B8'} />
      )}
    </TouchableOpacity>
  );
}
