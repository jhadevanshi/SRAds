import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EarningsScreen from '../screens/EarningsScreen';
import TripsHistoryScreen from '../screens/TripsHistoryScreen';
import VehicleInfoScreen from '../screens/VehicleInfoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AdvertisementHistoryScreen from '../screens/AdvertisementHistoryScreen';
import SupportScreen from '../screens/SupportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddBankScreen from '../screens/AddBankScreen';
import LanguageScreen from '../screens/LanguageScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {userToken == null ? (
        // No token found, user isn't signed in
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // User is signed in
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Earnings" component={EarningsScreen} />
          <Stack.Screen name="TripsHistory" component={TripsHistoryScreen} />
          <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="AdvertisementHistory" component={AdvertisementHistoryScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          
          {/* Settings Sub-Screens */}
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="AddBank" component={AddBankScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
