import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both your email address and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      Alert.alert('Sign In Failed', res.message || 'Invalid credentials. Please check your email and password.');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset instructions would be sent to your email.');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          
          <View className="max-w-md w-full mx-auto flex-1 justify-center">
            
            <View className="mb-10 items-center">
              <View className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[20px] items-center justify-center shadow-sm mb-6">
                <Building2 size={32} className="text-[#F59E0B]" />
              </View>
              <Text className="text-[28px] font-black text-slate-900 tracking-tight text-center mb-2">Welcome Back</Text>
              <Text className="text-slate-500 text-[15px] font-medium text-center leading-relaxed">
                Manage your screen advertising campaigns across the network.
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">Email Address</Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <Mail size={20} className="text-slate-400" />
                </View>
                <TextInput
                  className={`bg-slate-50 text-slate-900 border ${focusedField === 'email' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-11 pr-4 h-[52px] text-[15px] font-medium`}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">Password</Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10">
                  <Lock size={20} className="text-slate-400" />
                </View>
                <TextInput
                  className={`bg-slate-50 text-slate-900 border ${focusedField === 'password' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-11 pr-12 h-[52px] text-[15px] font-medium`}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity 
                  className="absolute right-2 p-2 z-10" 
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? <EyeOff size={20} className="text-slate-400" /> : <Eye size={20} className="text-slate-400" />}
                </TouchableOpacity>
              </View>
            </View>

            <View className="items-end mb-8 mt-2">
              <TouchableOpacity onPress={handleForgotPassword} className="py-1">
                <Text className="text-slate-500 font-semibold text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className={`rounded-[16px] h-[56px] flex-row justify-center items-center shadow-md ${loading ? 'bg-amber-400' : 'bg-[#F59E0B] shadow-amber-500/25'}`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-black text-lg">Sign In to Portal →</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10">
              <Text className="text-slate-500 font-medium text-[15px]">New to SRAds Network? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-[#F59E0B] font-bold text-[15px]">Create an Account</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
