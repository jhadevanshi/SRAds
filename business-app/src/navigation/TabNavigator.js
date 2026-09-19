import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Megaphone, Clapperboard, BarChart3, WalletCards } from 'lucide-react-native';

import DashboardScreen from '../screens/main/DashboardScreen';
import CampaignsScreen from '../screens/main/CampaignsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import AdsStackNavigator from './AdsStackNavigator';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const theme = useTheme();
  const isDarkMode = theme?.isDark ?? theme?.isDarkMode ?? true;
  const insets = useSafeAreaInsets();

  // Ensure bottom padding accounts for Android 3-button nav / gesture pill and iOS home indicator
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 14 : 20);
  const tabHeight = 60 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#100A24' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#241747' : '#EDE9FE',
          borderTopWidth: 1.2,
          paddingBottom: bottomInset,
          paddingTop: 8,
          height: tabHeight,
          elevation: 20,
          shadowColor: isDarkMode ? '#A855F7' : '#7C3AED',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: isDarkMode ? 0.18 : 0.08,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: isDarkMode ? '#C084FC' : '#7C3AED',
        tabBarInactiveTintColor: isDarkMode ? '#64538A' : '#94A3B8',
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && (isDarkMode ? styles.activeGlowDark : styles.activeGlowLight)]}>
              <LayoutDashboard size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="My Ads" 
        component={CampaignsScreen} 
        options={{
          tabBarLabel: 'Campaigns',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && (isDarkMode ? styles.activeGlowDark : styles.activeGlowLight)]}>
              <Megaphone size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={AdsStackNavigator} 
        options={{
          tabBarLabel: 'Media Hub',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && (isDarkMode ? styles.activeGlowDark : styles.activeGlowLight)]}>
              <Clapperboard size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && (isDarkMode ? styles.activeGlowDark : styles.activeGlowLight)]}>
              <BarChart3 size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && (isDarkMode ? styles.activeGlowDark : styles.activeGlowLight)]}>
              <WalletCards size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  activeGlowDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  activeGlowLight: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  }
});
