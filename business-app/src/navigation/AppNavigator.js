import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import AddMoneyScreen from '../screens/main/AddMoneyScreen';
import LiveFleetScreen from '../screens/main/LiveFleetScreen';
import CreateCampaignScreen from '../screens/main/CreateCampaignScreen';
import UploadAdScreen from '../screens/main/UploadAdScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' }}>
        <ActivityIndicator size="large" color="#F5C518" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Group>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Settings" component={SettingsStackNavigator} />
            <Stack.Screen name="AddMoney" component={AddMoneyScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="LiveFleet" component={LiveFleetScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="CreateCampaign" component={CreateCampaignScreen} />
            <Stack.Screen name="UploadAd" component={UploadAdScreen} />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
