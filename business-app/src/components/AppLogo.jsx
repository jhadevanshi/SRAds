import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';

export default function AppLogo({ 
  size = 40, 
  withSquircle = true, 
  variant = 'auto', // 'auto' | 'light' | 'dark' | 'brand'
  isDark = true,
  style 
}) {
  const isDarkTheme = variant === 'dark' ? true : (variant === 'light' || variant === 'brand' ? false : isDark);
  
  const bgId = `app_logo_bg_${size}_${isDarkTheme ? 'dark' : 'light'}`;
  const mainBarId = `app_logo_main_${size}`;
  const accentBarId = `app_logo_accent_${size}`;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          {/* Background Soft Gradient */}
          <LinearGradient id={bgId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={isDarkTheme ? '#1E1438' : '#FDFDFF'} />
            <Stop offset="100%" stopColor={isDarkTheme ? '#130C26' : '#F1F0FB'} />
          </LinearGradient>

          {/* Main Purple Left Pillar Gradient */}
          <LinearGradient id={mainBarId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7C63F5" />
            <Stop offset="100%" stopColor="#5A4FCF" />
          </LinearGradient>

          {/* Light Lavender Right Accent Bar Gradient */}
          <LinearGradient id={accentBarId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#B2A8FA" />
            <Stop offset="100%" stopColor="#9385F7" />
          </LinearGradient>
        </Defs>

        {withSquircle && (
          <Rect 
            x="32" 
            y="32" 
            width="448" 
            height="448" 
            rx="112" 
            ry="112" 
            fill={`url(#${bgId})`} 
            stroke={isDarkTheme ? '#34215E' : '#EAEAFA'} 
            strokeWidth="8"
          />
        )}

        <G>
          {/* Right Accent Bar (Soft Lavender Short Stroke) */}
          <Rect 
            x="284" 
            y="226" 
            width="72" 
            height="150" 
            rx="36" 
            ry="36" 
            fill={`url(#${accentBarId})`} 
            transform="rotate(-28 320 301)"
          />

          {/* Left Main Bar (Deep Electric Purple Long Stroke) */}
          <Rect 
            x="182" 
            y="136" 
            width="76" 
            height="250" 
            rx="38" 
            ry="38" 
            fill={`url(#${mainBarId})`} 
            transform="rotate(28 220 261)"
          />
        </G>
      </Svg>
    </View>
  );
}
