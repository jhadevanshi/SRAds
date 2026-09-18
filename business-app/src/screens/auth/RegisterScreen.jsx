import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { businessService } from '../../services/business';
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Circle, Check } from 'lucide-react-native';

const InputWrapper = ({ label, icon: Icon, children, fieldName, focusedField }) => (
  <View className="mb-5">
    <Text className="text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">{label}</Text>
    <View className="relative justify-center">
      {Icon && (
        <View className="absolute left-4 z-10">
          <Icon size={20} className={focusedField === fieldName ? 'text-[#F59E0B]' : 'text-slate-400'} />
        </View>
      )}
      {children}
    </View>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [form, setForm] = useState({
    company_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: ''
  });

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-slate-200', text: '' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', bars: 1 };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600', bars: 3 };
    return { label: 'Medium', color: 'bg-[#F59E0B]', text: 'text-[#F59E0B]', bars: 2 };
  };

  const handleContinue = () => {
    if (!form.company_name) return Alert.alert('Missing Information', 'Please enter your business name.');
    if (!form.owner_name) return Alert.alert('Missing Information', "Please enter the owner's full name.");
    if (!form.email) return Alert.alert('Missing Information', 'Please enter a valid email address.');
    if (!form.phone) return Alert.alert('Missing Information', 'Please enter a valid phone number.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
    
    // Quick simple phone validation (allowing digits and spaces)
    const digitsOnly = form.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
    }

    setStep(2);
  };

  const handleRegister = async () => {
    if (!form.password) return Alert.alert('Missing Information', 'Please create a password.');
    
    if (form.password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
    }
    if (form.password !== form.confirm_password) {
      return Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
    }
    if (!termsAccepted) {
      return Alert.alert('Terms of Service', 'Please accept the Terms of Service and Privacy Policy to continue.');
    }

    setLoading(true);
    try {
      const res = await businessService.register(form);
      if (res.success) {
        Alert.alert('Account created successfully 🎉', 'Your business account is ready. Let\'s get your first advertisement on BRT screens.', [
          { text: 'Continue to Sign In', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Registration Failed', res.message || 'Error occurred');
      }
    } catch (err) {
      if (!err.response) {
        Alert.alert('Network Error', 'Cannot connect to the server. Please check your internet connection.');
      } else {
        const errorMsg = err.response?.data?.message || 'Server error';
        if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
          Alert.alert('Email Registered', 'This email is already registered. Please sign in instead.');
        } else {
          Alert.alert('Registration Error', errorMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = form.password.length > 0 && form.password === form.confirm_password;
  const strength = getPasswordStrength(form.password);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        
        {/* Progress Header */}
        <View className="px-6 pt-4 pb-4 border-b border-slate-100 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {step === 2 ? (
              <TouchableOpacity onPress={() => setStep(1)} className="mr-4 p-2 -ml-2 rounded-full bg-slate-50">
                <ArrowLeft size={20} className="text-slate-900" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 -ml-2 rounded-full bg-slate-50">
                <ArrowLeft size={20} className="text-slate-900" />
              </TouchableOpacity>
            )}
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 2</Text>
              <Text className="text-lg font-black text-slate-900 tracking-tight">{step === 1 ? 'Business Profile' : 'Account Security'}</Text>
            </View>
          </View>
          <View className="flex-row gap-1">
            <View className={`h-1.5 w-6 rounded-full ${step >= 1 ? 'bg-[#F59E0B]' : 'bg-slate-200'}`} />
            <View className={`h-1.5 w-6 rounded-full ${step >= 2 ? 'bg-[#F59E0B]' : 'bg-slate-200'}`} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
          <View className="max-w-md w-full mx-auto">
            
            {step === 1 && (
              <View>
                <View className="mb-8">
                  <Text className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Tell us about your business</Text>
                  <Text className="text-[#94A3B8] text-[15px] font-medium leading-relaxed">A few details to get your business account started.</Text>
                </View>

                <InputWrapper label="Business Name *" fieldName="company_name" focusedField={focusedField} icon={Building2}>
                  <TextInput
                    className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'company_name' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-12 pr-4 h-[52px] text-[15px] font-medium`}
                    placeholder="Enter business name"
                    placeholderTextColor="#94A3B8"
                    value={form.company_name}
                    onChangeText={(t) => setForm({...form, company_name: t})}
                    onFocus={() => setFocusedField('company_name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </InputWrapper>

                <InputWrapper label="Owner Full Name *" fieldName="owner_name" focusedField={focusedField} icon={User}>
                  <TextInput
                    className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'owner_name' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-12 pr-4 h-[52px] text-[15px] font-medium`}
                    placeholder="Enter owner's full name"
                    placeholderTextColor="#94A3B8"
                    value={form.owner_name}
                    onChangeText={(t) => setForm({...form, owner_name: t})}
                    onFocus={() => setFocusedField('owner_name')}
                    onBlur={() => setFocusedField(null)}
                  />
                </InputWrapper>

                <InputWrapper label="Work Email Address *" fieldName="email" focusedField={focusedField} icon={Mail}>
                  <TextInput
                    className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'email' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-12 pr-4 h-[52px] text-[15px] font-medium`}
                    placeholder="you@company.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(t) => setForm({...form, email: t})}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </InputWrapper>

                <View className="mb-5">
                  <Text className="text-slate-700 text-xs font-bold mb-2 uppercase tracking-wide">Phone Number *</Text>
                  <View className="relative justify-center flex-row items-center">
                    <View className="absolute left-4 z-10">
                      <Phone size={20} className={focusedField === 'phone' ? 'text-[#F59E0B]' : 'text-slate-400'} />
                    </View>
                    <View className="absolute left-[44px] z-10 border-r border-slate-200 pr-3 h-[24px] justify-center">
                      <Text className="text-[#0F172A] font-bold text-[15px]">+91</Text>
                    </View>
                    <TextInput
                      className={`flex-1 bg-slate-50 text-[#0F172A] border ${focusedField === 'phone' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-[94px] pr-4 h-[52px] text-[15px] font-medium`}
                      placeholder="XXXXX XXXXX"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={form.phone}
                      onChangeText={(t) => setForm({...form, phone: t})}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  className="bg-[#F59E0B] rounded-[16px] h-[56px] flex-row justify-center items-center mt-6 shadow-md shadow-amber-500/25"
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-black text-lg">Continue to Security →</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-8 pb-10">
                  <Text className="text-[#94A3B8] font-medium text-[15px]">Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-[#F59E0B] font-bold text-[15px]">Sign in</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 2 && (
              <View>
                <View className="mb-8">
                  <Text className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Secure your account</Text>
                  <Text className="text-[#94A3B8] text-[15px] font-medium leading-relaxed">Create a secure password for your business portal.</Text>
                </View>

                <InputWrapper label="Password *" fieldName="password" focusedField={focusedField} icon={Lock}>
                  <TextInput
                    className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'password' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-12 pr-12 h-[52px] text-[15px] font-medium`}
                    placeholder="Create a password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={form.password}
                    onChangeText={(t) => setForm({...form, password: t})}
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
                </InputWrapper>

                {/* Password Strength Indicator */}
                {form.password.length > 0 && (
                  <View className="flex-row items-center justify-between mb-5 -mt-2 px-1">
                    <View className="flex-row gap-1 flex-1 mr-4">
                      <View className={`h-1.5 flex-1 rounded-full ${strength.bars >= 1 ? strength.color : 'bg-slate-100'}`} />
                      <View className={`h-1.5 flex-1 rounded-full ${strength.bars >= 2 ? strength.color : 'bg-slate-100'}`} />
                      <View className={`h-1.5 flex-1 rounded-full ${strength.bars >= 3 ? strength.color : 'bg-slate-100'}`} />
                    </View>
                    <Text className={`text-xs font-bold ${strength.text}`}>{strength.label}</Text>
                  </View>
                )}

                <InputWrapper label="Confirm Password *" fieldName="confirm_password" focusedField={focusedField} icon={Lock}>
                  <TextInput
                    className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'confirm_password' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] pl-12 pr-4 h-[52px] text-[15px] font-medium`}
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    autoCapitalize="none"
                    value={form.confirm_password}
                    onChangeText={(t) => setForm({...form, confirm_password: t})}
                    onFocus={() => setFocusedField('confirm_password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </InputWrapper>

                {/* Confirm Password Feedback */}
                {form.confirm_password.length > 0 && (
                  <View className="flex-row items-center mb-5 -mt-2 px-1">
                    {isPasswordMatch ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-500 mr-2" />
                        <Text className="text-emerald-600 font-bold text-xs">Passwords match</Text>
                      </>
                    ) : (
                      <>
                        <Circle size={16} className="text-red-400 mr-2" />
                        <Text className="text-red-500 font-bold text-xs">Passwords do not match</Text>
                      </>
                    )}
                  </View>
                )}

                <View className="mb-6 mt-2">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide">Business Address</Text>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">Optional</Text>
                  </View>
                  
                  {!showAddress ? (
                    <TouchableOpacity 
                      className="border border-dashed border-slate-300 rounded-[16px] h-[52px] justify-center items-center bg-slate-50/50"
                      onPress={() => setShowAddress(true)}
                    >
                      <Text className="text-[#F59E0B] font-bold text-sm">+ Add business address</Text>
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      className={`bg-slate-50 text-[#0F172A] border ${focusedField === 'address' ? 'border-[#F59E0B]' : 'border-slate-200'} rounded-[16px] p-4 h-28 text-[15px] font-medium`}
                      placeholder="Enter your full business address"
                      placeholderTextColor="#94A3B8"
                      multiline
                      textAlignVertical="top"
                      value={form.address}
                      onChangeText={(t) => setForm({...form, address: t})}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField(null)}
                    />
                  )}
                </View>

                {/* Terms and Privacy */}
                <TouchableOpacity 
                  className="flex-row items-start mb-8 pr-4" 
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.7}
                >
                  <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${termsAccepted ? 'bg-[#F59E0B] border-[#F59E0B]' : 'border-slate-300 bg-white'}`}>
                    {termsAccepted && <Check size={16} color="white" strokeWidth={3} />}
                  </View>
                  <Text className="text-slate-600 text-sm leading-relaxed flex-1">
                    I agree to SRAds <Text className="text-[#0F172A] font-bold">Terms of Service</Text> and <Text className="text-[#0F172A] font-bold">Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className={`rounded-[16px] h-[56px] flex-row justify-center items-center shadow-md pb-1 ${(!termsAccepted || loading) ? 'bg-slate-200' : 'bg-[#F59E0B] shadow-amber-500/25'}`}
                  onPress={handleRegister}
                  disabled={!termsAccepted || loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={termsAccepted ? '#FFFFFF' : '#94A3B8'} />
                  ) : (
                    <Text className={`${termsAccepted ? 'text-white' : 'text-slate-400'} font-black text-lg`}>Create Business Account ✓</Text>
                  )}
                </TouchableOpacity>

              </View>
            )}
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
