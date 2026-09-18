import React from 'react';
import { Switch } from 'react-native';
import SettingsRow from './SettingsRow';

export default function SwitchRow({ icon, title, subtitle, value, onValueChange, hideBorder, disabled }) {
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
          trackColor={{ false: '#E2E8F0', true: '#F59E0B' }}
          thumbColor="#FFFFFF"
          disabled={disabled}
        />
      }
    />
  );
}
