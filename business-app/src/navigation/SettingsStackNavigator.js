import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import AccountDetailsScreen from '../screens/settings/AccountDetailsScreen';
import PaymentMethodsScreen from '../screens/settings/PaymentMethodsScreen';
import AddPaymentScreen from '../screens/settings/AddPaymentScreen';
import DevicesListScreen from '../screens/settings/DevicesListScreen';
import DeviceDetailsScreen from '../screens/settings/DeviceDetailsScreen';
import InvoicesScreen from '../screens/settings/InvoicesScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsMainScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
      <Stack.Screen name="DevicesList" component={DevicesListScreen} />
      <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
    </Stack.Navigator>
  );
}
