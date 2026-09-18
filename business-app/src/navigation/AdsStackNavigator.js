import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdsListScreen from '../screens/main/AdsListScreen';

const Stack = createNativeStackNavigator();

export default function AdsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }}>
      <Stack.Screen name="AdsList" component={AdsListScreen} />
    </Stack.Navigator>
  );
}
