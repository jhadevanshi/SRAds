import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Required for NativeWind
import { NativeWindStyleSheet } from "nativewind";
NativeWindStyleSheet.setOutput({
  default: "native",
});

// Validate API URL on startup — fail fast with clear error
let API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';
if (API_URL.includes('192.168.') || API_URL.includes('10.0.') || API_URL.includes('172.16.')) {
  API_URL = 'https://coxcred.com/srads/api';
}
console.log('[CONFIG] API URL:', API_URL);

// Test connectivity on startup
const healthUrl = API_URL.endsWith('/api') ? `${API_URL}/health` : `${API_URL}/api/health`;
fetch(healthUrl)
  .then(r => r.json())
  .then(data => console.log('[CONFIG] Backend reachable:', data))
  .catch(e => console.error('[CONFIG] Backend NOT reachable:', e.message));

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
