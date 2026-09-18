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
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not set in .env file!');
}

if (API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
  console.error('[CONFIG] WARNING: Using localhost URL — will not work on physical device!');
}

console.log('[CONFIG] API URL:', API_URL);

// Test connectivity on startup
fetch(`${API_URL}/api/health`)
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
