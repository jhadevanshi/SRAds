import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, Check, MonitorSmartphone } from 'lucide-react-native';
import AppLogo from '../../components/AppLogo';

// Authentic Google 4-Color Vector Icon
function GoogleIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </Svg>
  );
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const scrollViewRef = useRef(null);
  const activeOffsetRef = useRef(140);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        if (savedEmail) {
          setEmail(prev => (prev ? prev : savedEmail));
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
      Alert.alert('Missing Details', 'Please enter your work email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid work email address.');
      return;
    }

    Keyboard.dismiss();
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
      'Please contact support at support@srads.com or your account manager to reset your business portal password.'
    );
  };

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
            { paddingBottom: (keyboardVisible || keyboardHeight > 0) ? Math.max(keyboardHeight, 220) + 60 : 50 }
          ]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.container}>
            
            {/* ── Brand & Official Vector Logo ───────────────────────────────── */}
            <View style={styles.headerSection}>
              <View style={[styles.logoContainer, isDark ? styles.neonGlowDark : styles.neonGlowLight]}>
                <AppLogo size={78} isDark={isDark} />
              </View>

              <Text style={[styles.brandTitle, { color: isDark ? '#F8FAFC' : '#1E1B4B' }]}>
                Adsnetvo
              </Text>
              <Text style={[styles.brandSubtitle, { color: isDark ? '#C084FC' : '#6D28D9' }]}>
                Smart Display Advertising on the Go
              </Text>
            </View>

            {/* ── Welcome Heading ────────────────────────────────────────── */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Welcome Back
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                Sign in to manage your digital transit campaigns
              </Text>
            </View>

            {/* ── Form Inputs ────────────────────────────────────────────── */}
            <View style={styles.formSection}>
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                  Work Email
                </Text>
                <View 
                  style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1',
                    }
                  ]}
                >
                  <Mail size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                    placeholder="name@company.com"
                    placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    autoComplete="email"
                    importantForAutofill="yes"
                    returnKeyType="next"
                    underlineColorAndroid="transparent"
                    cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                    selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                    value={email}
                    onFocus={() => scrollToOffset(80)}
                    onTouchStart={() => { activeOffsetRef.current = 80; }}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                  Password
                </Text>
                <View 
                  style={[
                    styles.inputWrapper,
                    { 
                      backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#CBD5E1',
                    }
                  ]}
                >
                  <Lock size={19} color={isDark ? '#A855F7' : '#7C3AED'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: isDark ? '#FFFFFF' : '#111827' }]}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    autoComplete="password"
                    importantForAutofill="yes"
                    returnKeyType="done"
                    underlineColorAndroid="transparent"
                    cursorColor={isDark ? '#C084FC' : '#7C3AED'}
                    selectionColor={isDark ? 'rgba(192, 132, 252, 0.4)' : 'rgba(124, 58, 237, 0.3)'}
                    onSubmitEditing={handleLogin}
                    value={password}
                    onFocus={() => scrollToOffset(180)}
                    onTouchStart={() => { activeOffsetRef.current = 180; }}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity 
                    style={styles.showPasswordBtn} 
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <View style={styles.showPasswordInner}>
                        <EyeOff size={16} color={isDark ? '#C084FC' : '#7C3AED'} />
                        <Text style={[styles.showPasswordText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>Hide</Text>
                      </View>
                    ) : (
                      <View style={styles.showPasswordInner}>
                        <Eye size={16} color={isDark ? '#C084FC' : '#7C3AED'} />
                        <Text style={[styles.showPasswordText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>Show</Text>
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
                    rememberMe ? styles.checkboxActive : (isDark ? styles.checkboxInactiveDark : styles.checkboxInactiveLight)
                  ]}>
                    {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.rememberMeText, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={[styles.forgotPasswordText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>
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
                    isDark ? styles.ctaGlowDark : styles.ctaGlowLight
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
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#281B4B' : '#E5E7EB' }]} />
                <Text style={[styles.dividerText, { color: isDark ? '#94A3B8' : '#9CA3AF' }]}>
                  Or continue with
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: isDark ? '#281B4B' : '#E5E7EB' }]} />
              </View>

              {/* ── Full-Width Google Sign-In Button (Android Optimized) ───── */}
              <TouchableOpacity 
                style={[
                  styles.googleButton,
                  { 
                    backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.4)' : '#CBD5E1',
                    shadowColor: isDark ? '#7C3AED' : '#000000',
                    shadowOpacity: isDark ? 0.25 : 0.08,
                  }
                ]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Google Sign-In', 'Google Corporate Single Sign-On is available for verified merchant domains.')}
              >
                <GoogleIcon size={20} />
                <Text style={[styles.googleButtonText, { color: isDark ? '#F8FAFC' : '#1E1B4B' }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

            </View>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <View style={styles.footerSection}>
              <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#6B7280' }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: isDark ? '#C084FC' : '#7C3AED' }]}>
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
    paddingTop: 32,
    paddingBottom: 44,
  },
  container: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Header / Logo
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 10,
  },
  logoGradient: {
    width: 68,
    height: 68,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonGlowDark: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  neonGlowLight: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.6,
    marginBottom: 3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
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
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  showPasswordInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    width: 19,
    height: 19,
    borderRadius: 6,
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
    borderColor: '#3B2A68',
    backgroundColor: '#140F24',
  },
  checkboxInactiveLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  rememberMeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // CTA Button
  ctaButtonWrapper: {
    width: '100%',
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

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    paddingHorizontal: 12,
  },

  // Google Full-Width Button
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Footer
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
