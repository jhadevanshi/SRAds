import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarFront, Phone, Lock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(phone, password);
      if (!result.success) {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error details:', err.response?.data || err.message || err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 justify-center"
      >
        <View className="mb-10 items-center">
          <View className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <CarFront size={32} color="#0284c7" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">Driver Login</Text>
          <Text className="text-gray-500 mt-2 text-sm text-center">Welcome back! Please enter your details.</Text>
        </View>

        <View className="space-y-5">
          {error ? (
            <View className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
              <Text className="text-red-600 text-sm text-center font-medium">{error}</Text>
            </View>
          ) : null}
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Phone size={18} color="#9ca3af" />
              </View>
              <TextInput
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Lock size={18} color="#9ca3af" />
              </View>
              <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full bg-primary-600 py-3.5 px-4 rounded-xl shadow-sm flex-row justify-center items-center gap-2 mt-4 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold text-base">Login securely</Text>
                <ArrowRight size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
