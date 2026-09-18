import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function PrimaryButton({ title, onPress, className = '', color = 'bg-slate-900', textColor = 'text-white' }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className={`px-6 py-4 rounded-2xl items-center justify-center ${color} ${className}`}
    >
      <Text className={`font-bold text-base tracking-wide ${textColor}`}>{title}</Text>
    </TouchableOpacity>
  );
}
