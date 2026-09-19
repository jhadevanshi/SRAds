import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, Check, Sparkles, MonitorSmartphone } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    // Load remembered email
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        // Ignore
      }
    };
    loadRememberedEmail();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Details', 'Please enter your email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid work email address.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('remembered_email', email.trim());
      } else {
        await AsyncStorage.removeItem('remembered_email');
      }

      const res = await login(email.trim(), password);
      if (!res.success) {
        Alert.alert('Sign In Failed', res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Please contact administrator at support@srads.com or your account manager to reset your password.'
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flex1}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            
            {/* ── Brand & 3D Glowing Icon ───────────────────────────────── */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.logoGradient,
                    isDarkMode ? styles.neonGlowDark : styles.neonGlowLight
                  ]}
                >
                  <View style={styles.logoInner}>
                    <MonitorSmartphone size={32} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                </LinearGradient>
              </View>

              <Text style={[styles.brandTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                Adsnetvo
              </Text>
              <Text style={[styles.brandSubtitle, { color: isDarkMode ? '#A78BFA' : '#6B7280' }]}>
                Smart Display Advertising on the Go
              </Text>
            </View>

            {/* ── Welcome Heading ────────────────────────────────────────── */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>
                Welcome Back
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Log in to manage your digital transit ad campaigns
              </Text>
            </View>

            {/* ── Form Inputs ────────────────────────────────────────────── */}
            <View style={styles.formSection}>
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                  Work Email
                </Text>
                <View 
                  style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF',
                      borderColor: focusedField === 'email' 
                        ? '#A855F7' 
                        : (isDarkMode ? '#281B4B' : '#E2E8F0'),
                    },
                    focusedField === 'email' && (isDarkMode ? styles.inputFocusedDark : styles.inputFocusedLight)
                  ]}
                >
                  <Mail size={19} color={focusedField === 'email' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                    placeholder="name@company.com"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                  Password
                </Text>
                <View 
                  style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF',
                      borderColor: focusedField === 'password' 
                        ? '#A855F7' 
                        : (isDarkMode ? '#281B4B' : '#E2E8F0'),
                    },
                    focusedField === 'password' && (isDarkMode ? styles.inputFocusedDark : styles.inputFocusedLight)
                  ]}
                >
                  <Lock size={19} color={focusedField === 'password' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                    placeholder="••••••••"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity 
                    style={styles.showPasswordBtn} 
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <View style={styles.showPasswordInner}>
                        <EyeOff size={16} color={isDarkMode ? '#A78BFA' : '#6B7280'} />
                        <Text style={[styles.showPasswordText, { color: isDarkMode ? '#A78BFA' : '#6B7280' }]}>Hide</Text>
                      </View>
                    ) : (
                      <View style={styles.showPasswordInner}>
                        <Eye size={16} color={isDarkMode ? '#A78BFA' : '#6B7280'} />
                        <Text style={[styles.showPasswordText, { color: isDarkMode ? '#A78BFA' : '#6B7280' }]}>Show</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity 
                  style={styles.rememberMeRow} 
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    rememberMe ? styles.checkboxActive : (isDarkMode ? styles.checkboxInactiveDark : styles.checkboxInactiveLight)
                  ]}>
                    {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.rememberMeText, { color: isDarkMode ? '#94A3B8' : '#4B5563' }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={[styles.forgotPasswordText, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Main CTA Gradient Button ────────────────────────────── */}
              <TouchableOpacity 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.88}
                style={styles.ctaButtonWrapper}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.ctaGradient,
                    isDarkMode ? styles.ctaGlowDark : styles.ctaGlowLight
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.ctaButtonText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* ── Or continue with Divider ─────────────────────────────── */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#281B4B' : '#E5E7EB' }]} />
                <Text style={[styles.dividerText, { color: isDarkMode ? '#64748B' : '#9CA3AF' }]}>
                  Or continue with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#281B4B' : '#E5E7EB' }]} />
              </View>

              {/* ── Social Login Pill Buttons ────────────────────────────── */}
              <View style={styles.socialButtonsRow}>
                <TouchableOpacity 
                  style={[
                    styles.socialButton,
                    { 
                      backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF',
                      borderColor: isDarkMode ? '#281B4B' : '#E2E8F0'
                    }
                  ]}
                  activeOpacity={0.75}
                  onPress={() => Alert.alert('Google Sign-In', 'Google corporate sign-in is enabled for enterprise accounts.')}
                >
                  <Text style={styles.socialIconG}>G</Text>
                  <Text style={[styles.socialButtonText, { color: isDarkMode ? '#F8FAFC' : '#374151' }]}>
                    Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.socialButton,
                    { 
                      backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF',
                      borderColor: isDarkMode ? '#281B4B' : '#E2E8F0'
                    }
                  ]}
                  activeOpacity={0.75}
                  onPress={() => Alert.alert('Apple Sign-In', 'Apple ID corporate sign-in is enabled for enterprise accounts.')}
                >
                  <Text style={[styles.socialIconApple, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}></Text>
                  <Text style={[styles.socialButtonText, { color: isDarkMode ? '#F8FAFC' : '#374151' }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <View style={styles.footerSection}>
              <Text style={[styles.footerText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>
                  Sign Up
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
    paddingBottom: 28,
    justifyContent: 'center',
  },
  container: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Header / Logo
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonGlowDark: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  neonGlowLight: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // Form Section
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
  },
  inputFocusedDark: {
    borderColor: '#C084FC',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  inputFocusedLight: {
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  showPasswordBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  showPasswordInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showPasswordText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Options Row
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 22,
    paddingHorizontal: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  checkboxInactiveDark: {
    borderColor: '#4C3B78',
    backgroundColor: '#140F24',
  },
  checkboxInactiveLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  rememberMeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA Button
  ctaButtonWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  ctaGradient: {
    height: 52,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
  },

  // Social Buttons
  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 8,
  },
  socialIconG: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA4335',
  },
  socialIconApple: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
