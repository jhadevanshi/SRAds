import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Video, Megaphone, BarChart3, Wallet } from 'lucide-react-native';

import DashboardScreen from '../screens/main/DashboardScreen';
import CampaignsScreen from '../screens/main/CampaignsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import AdsStackNavigator from './AdsStackNavigator';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#161B22' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#30363D' : '#F1F5F9',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#F59E0B',
        tabBarInactiveTintColor: isDarkMode ? '#8B949E' : '#94A3B8',
        tabBarLabelStyle: {
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
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="My Ads" 
        component={CampaignsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Megaphone size={size} color={color} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={AdsStackNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => <Video size={size} color={color} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} strokeWidth={2.5} />
        }}
      />
    </Tab.Navigator>
  );
}
