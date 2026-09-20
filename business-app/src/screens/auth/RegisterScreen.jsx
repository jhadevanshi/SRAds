import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Keyboard, BackHandler 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { businessService } from '../../services/business';
import { 
  Building2, User, Mail, Phone, Lock, Eye, EyeOff, 
  ArrowLeft, Check, MapPin 
} from 'lucide-react-native';
import AppLogo from '../../components/AppLogo';

export default function RegisterScreen({ navigation }) {
  const { isDark } = useTheme();
  const scrollViewRef = useRef(null);
  const activeOffsetRef = useRef(100);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToOffset = (offset) => {
    activeOffsetRef.current = offset;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: offset, animated: true });
    }, 100);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const kHeight = e.endCoordinates?.height || 280;
        setKeyboardVisible(true);
        setKeyboardHeight(kHeight);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: activeOffsetRef.current, animated: true });
        }, 120);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Hardware back press on Android (allows returning from Step 2 to Step 1 smoothly)
  useEffect(() => {
    const backAction = () => {
      if (step === 2) {
        Keyboard.dismiss();
        setStep(1);
        setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [step]);
  
  const [form, setForm] = useState({
    company_name: '',
    owner_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    address: '',
    area: '',
    city: 'Ahmedabad',
    business_type: 'Retail / Service'
  });

  const getPasswordStrength = (pass) => {
    if (!pass || pass.length === 0) return { label: '', color: '#CBD5E1', bars: 0 };
    if (pass.length < 6) return { label: 'Weak', color: '#EF4444', bars: 1 };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'Strong', color: '#10B981', bars: 3 };
    return { label: 'Medium', color: '#F59E0B', bars: 2 };
  };

  const handleContinue = () => {
    if (!form.company_name.trim()) return Alert.alert('Missing Details', 'Please enter your company or business name.');
    if (!form.owner_name.trim()) return Alert.alert('Missing Details', "Please enter the authorized owner or manager's name.");
    if (!form.email.trim()) return Alert.alert('Missing Details', 'Please enter a valid work email address.');
    if (!form.phone.trim()) return Alert.alert('Missing Details', 'Please enter your mobile phone number.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
    
    const digitsOnly = form.phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
    }

    Keyboard.dismiss();
    setStep(2);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleRegister = async () => {
    if (!form.password) return Alert.alert('Missing Details', 'Please create a secure password.');
    if (form.password.length < 6) {
      return Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
    }
    if (form.password !== form.confirm_password) {
      return Alert.alert('Password Mismatch', 'Passwords do not match. Please verify.');
    }
    if (!termsAccepted) {
      return Alert.alert('Terms Required', 'Please accept the Advertiser Terms & Conditions to complete account setup.');
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      const res = await businessService.register({
        ...form,
        email: form.email.trim(),
        phone: form.phone.trim()
      });

      if (res.success) {
        Alert.alert(
          'Account Created 🎉', 
          'Your advertiser account has been created successfully! Sign in to create your first transit ad campaign.', 
          [{ text: 'Proceed to Sign In', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Registration Failed', res.message || 'Unable to register account.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Server error occurred.';
      if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
        Alert.alert('Email Registered', 'An account with this email already exists. Please sign in instead.');
      } else {
        Alert.alert('Registration Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#090614' : '#F8F7FF' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (keyboardVisible || keyboardHeight > 0) ? Math.max(keyboardHeight, 220) + 60 : 60 }
          ]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.container}>
            
            {/* ── Top Bar ──────────────────────────────────────────────── */}
            <View style={styles.topBar}>
              <TouchableOpacity 
                onPress={() => {
                  Keyboard.dismiss();
                  if (step === 2) {
                    setStep(1);
                    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
                  } else {
                    navigation.goBack();
                  }
                }}
                style={[
                  styles.backBtn,
                  { backgroundColor: isDark ? '#181033' : '#FFFFFF', borderColor: isDark ? '#281B4B' : '#E2E8F0' }
                ]}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#1E1B4B'} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  if (step === 2) {
                    Keyboard.dismiss();
                    setStep(1);
                    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
                  }
                }}
                activeOpacity={step === 2 ? 0.7 : 1}
                style={[
                  styles.stepBadge,
                  step === 2 ? { backgroundColor: isDark ? 'rgba(192, 132, 252, 0.2)' : '#EDE9FE', borderWidth: 1, borderColor: isDark ? '#7C3AED' : '#C084FC' } : null
                ]}
              >
                <Text style={[styles.stepBadgeText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>
                  {step === 2 ? '← Back to Step 1' : 'Step 1 of 2'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Heading & Brand ──────────────────────────────────────── */}
            <View style={styles.headingSection}>
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <AppLogo size={68} isDark={isDark} />
              </View>
              <Text style={[styles.mainTitle, { color: isDark ? '#F8FAFC' : '#111827' }]}>
                {step === 1 ? 'Create Business Account' : 'Security & Location'}
              </Text>
              <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                {step === 1 
                  ? 'Join Adsnetvo to launch dynamic DOOH campaigns across smart transit displays' 
                  : 'Set up your secure password and company headquarters'}
              </Text>
            </View>

            {/* ── Step Progress Indicator ───────────────────────────────── */}
            <TouchableOpacity 
              activeOpacity={step === 2 ? 0.8 : 1}
              onPress={() => {
                if (step === 2) {
                  Keyboard.dismiss();
                  setStep(1);
                  setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
                }
              }}
              style={styles.progressRow}
            >
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#281B4B' : '#E2E8F0' }]}>
                <LinearGradient
                  colors={['#7C3AED', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]}
                />
              </View>
            </TouchableOpacity>

            {/* ── STEP 1: Business Details ─────────────────────────────── */}
            {step === 1 ? (
              <View style={styles.formSection}>
                
                {/* Business Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Business / Company Name
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <Building2 size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="e.g. Blue Dart Logistics Ltd."
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.company_name}
                      onFocus={() => scrollToOffset(40)}
                      onTouchStart={() => { activeOffsetRef.current = 40; }}
                      onChangeText={(v) => setForm(f => ({ ...f, company_name: v }))}
                    />
                  </View>
                </View>

                {/* Owner Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Authorized Contact Person
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <User size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="Full Name (e.g. Rahul Sharma)"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.owner_name}
                      onFocus={() => scrollToOffset(120)}
                      onTouchStart={() => { activeOffsetRef.current = 120; }}
                      onChangeText={(v) => setForm(f => ({ ...f, owner_name: v }))}
                    />
                  </View>
                </View>

                {/* Work Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Work Email Address
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <Mail size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="name@company.com"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.email}
                      onFocus={() => scrollToOffset(200)}
                      onTouchStart={() => { activeOffsetRef.current = 200; }}
                      onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Phone Number
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <Phone size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="+91 98765 43210"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      keyboardType="phone-pad"
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.phone}
                      onFocus={() => scrollToOffset(280)}
                      onTouchStart={() => { activeOffsetRef.current = 280; }}
                      onChangeText={(v) => setForm(f => ({ ...f, phone: v }))}
                    />
                  </View>
                </View>

                {/* Continue CTA */}
                <TouchableOpacity 
                  onPress={handleContinue}
                  activeOpacity={0.88}
                  style={styles.ctaButtonWrapper}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.ctaGradient, isDark ? styles.ctaGlowDark : styles.ctaGlowLight]}
                  >
                    <Text style={styles.ctaButtonText}>Continue to Step 2 →</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            ) : (
              /* ── STEP 2: Password & Address ─────────────────────────── */
              <View style={styles.formSection}>
                
                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Create Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <Lock size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      secureTextEntry={!showPassword}
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.password}
                      onFocus={() => scrollToOffset(60)}
                      onTouchStart={() => { activeOffsetRef.current = 60; }}
                      onChangeText={(v) => setForm(f => ({ ...f, password: v }))}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordBtn}>
                      {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                    </TouchableOpacity>
                  </View>

                  {/* Password Strength Indicator */}
                  {form.password.length > 0 && (
                    <View style={styles.strengthRow}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3].map(i => (
                          <View 
                            key={i} 
                            style={[
                              styles.strengthBar, 
                              { backgroundColor: i <= strength.bars ? strength.color : (isDark ? '#281B4B' : '#E2E8F0') }
                            ]} 
                          />
                        ))}
                      </View>
                      <Text style={[styles.strengthText, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Confirm Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <Lock size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="Re-enter password"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      secureTextEntry={!showPassword}
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.confirm_password}
                      onFocus={() => scrollToOffset(160)}
                      onTouchStart={() => { activeOffsetRef.current = 160; }}
                      onChangeText={(v) => setForm(f => ({ ...f, confirm_password: v }))}
                    />
                  </View>
                </View>

                {/* Business Address & Area */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                    Business Area / Headquarters
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? '#140F24' : '#FFFFFF', borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1' }
                  ]}>
                    <MapPin size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                      placeholder="e.g. Navrangpura, SG Highway, Bopal"
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      underlineColorAndroid="transparent"
                      cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                      selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                      value={form.area}
                      onFocus={() => scrollToOffset(260)}
                      onTouchStart={() => { activeOffsetRef.current = 260; }}
                      onChangeText={(v) => setForm(f => ({ ...f, area: v }))}
                    />
                  </View>
                </View>

                {/* Terms Agreement */}
                <TouchableOpacity 
                  style={styles.termsRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.checkbox,
                    termsAccepted ? styles.checkboxActive : (isDark ? styles.checkboxInactiveDark : styles.checkboxInactiveLight)
                  ]}>
                    {termsAccepted && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.termsText, { color: isDark ? '#94A3B8' : '#4B5563' }]}>
                    I accept the <Text style={{ color: isDark ? '#C084FC' : '#7C3AED', fontWeight: 'bold' }}>Terms of Service</Text> and <Text style={{ color: isDark ? '#C084FC' : '#7C3AED', fontWeight: 'bold' }}>Advertiser Code of Conduct</Text>.
                  </Text>
                </TouchableOpacity>

                {/* Submit Register CTA */}
                <TouchableOpacity 
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.88}
                  style={styles.ctaButtonWrapper}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#9333EA', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.ctaGradient, isDark ? styles.ctaGlowDark : styles.ctaGlowLight]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.ctaButtonText}>Complete Registration 🎉</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Secondary Back to Step 1 Button */}
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setStep(1);
                    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
                  }}
                  style={[
                    styles.secondaryBackBtn,
                    { 
                      backgroundColor: isDark ? '#140F24' : '#FFFFFF', 
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#CBD5E1' 
                    }
                  ]}
                  activeOpacity={0.75}
                >
                  <ArrowLeft size={16} color={isDark ? '#C084FC' : '#7C3AED'} style={{ marginRight: 8 }} />
                  <Text style={[styles.secondaryBackText, { color: isDark ? '#F8FAFC' : '#1E1B4B' }]}>
                    Back to Step 1 (Edit Details)
                  </Text>
                </TouchableOpacity>

              </View>
            )}

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <View style={styles.footerSection}>
              <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  container: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headingSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressRow: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },
  showPasswordBtn: {
    padding: 6,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    marginRight: 12,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  checkboxInactiveDark: {
    borderColor: '#3B2A68',
    backgroundColor: '#140F24',
  },
  checkboxInactiveLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  termsText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  ctaButtonWrapper: {
    width: '100%',
    marginTop: 8,
    marginBottom: 20,
  },
  ctaGradient: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaGlowDark: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaGlowLight: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryBackBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  secondaryBackText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});
