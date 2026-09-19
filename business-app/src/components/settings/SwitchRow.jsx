import React from 'react';
import { Switch } from 'react-native';
import SettingsRow from './SettingsRow';
import { useTheme } from '../../context/ThemeContext';

export default function SwitchRow({ icon, title, subtitle, value, onValueChange, hideBorder, disabled }) {
  const { isDark } = useTheme();

  return (
    <SettingsRow 
      icon={icon}
      title={title}
      subtitle={subtitle}
      hideBorder={hideBorder}
      disabled={disabled}
      rightContent={
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: isDark ? '#281B4B' : '#E2E8F0', true: '#7C3AED' }}
          thumbColor="#FFFFFF"
          disabled={disabled}
        />
      }
    />
  );
}
