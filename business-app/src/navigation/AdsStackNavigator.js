import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdsListScreen from '../screens/main/AdsListScreen';
import UploadAdScreen from '../screens/main/UploadAdScreen';

const Stack = createNativeStackNavigator();

export default function AdsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdsList" component={AdsListScreen} />
      <Stack.Screen name="UploadAd" component={UploadAdScreen} />
    </Stack.Navigator>
  );
}