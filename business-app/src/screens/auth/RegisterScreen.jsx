import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, 
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { businessService } from '../../services/business';
import { 
  Building2, User, Mail, Phone, Lock, Eye, EyeOff, 
  ArrowLeft, Check, Sparkles, MapPin, ShieldCheck, CheckCircle2 
} from 'lucide-react-native';

export default function RegisterScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
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

    setStep(2);
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
            
            {/* ── Top Bar ──────────────────────────────────────────────── */}
            <View style={styles.topBar}>
              <TouchableOpacity 
                onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
                style={[
                  styles.backBtn,
                  { backgroundColor: isDarkMode ? '#181033' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#E2E8F0' }
                ]}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={isDarkMode ? '#F8FAFC' : '#1E1B4B'} />
              </TouchableOpacity>

              <View style={styles.stepBadge}>
                <Text style={[styles.stepBadgeText, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>
                  Step {step} of 2
                </Text>
              </View>
            </View>

            {/* ── Heading ──────────────────────────────────────────────── */}
            <View style={styles.headingSection}>
              <Text style={[styles.mainTitle, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}>
                {step === 1 ? 'Create Business Account' : 'Security & Location'}
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                {step === 1 
                  ? 'Join Adsnetvo to launch dynamic DOOH campaigns across smart transit displays' 
                  : 'Set up your secure password and company headquarters'}
              </Text>
            </View>

            {/* ── Step Progress Indicator ───────────────────────────────── */}
            <View style={styles.progressRow}>
              <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#281B4B' : '#E2E8F0' }]}>
                <LinearGradient
                  colors={['#7C3AED', '#A855F7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]}
                />
              </View>
            </View>

            {/* ── STEP 1: Business Details ─────────────────────────────── */}
            {step === 1 ? (
              <View style={styles.formSection}>
                
                {/* Business Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Business / Company Name
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'company_name' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <Building2 size={19} color={focusedField === 'company_name' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="e.g. Blue Dart Logistics Ltd."
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      value={form.company_name}
                      onChangeText={(v) => setForm(f => ({ ...f, company_name: v }))}
                      onFocus={() => setFocusedField('company_name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Owner Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Authorized Contact Person
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'owner_name' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <User size={19} color={focusedField === 'owner_name' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="Full Name (e.g. Rahul Sharma)"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      value={form.owner_name}
                      onChangeText={(v) => setForm(f => ({ ...f, owner_name: v }))}
                      onFocus={() => setFocusedField('owner_name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Work Email */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Work Email Address
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'email' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <Mail size={19} color={focusedField === 'email' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="name@company.com"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={form.email}
                      onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Phone Number
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'phone' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <Phone size={19} color={focusedField === 'phone' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="+91 98765 43210"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      keyboardType="phone-pad"
                      value={form.phone}
                      onChangeText={(v) => setForm(f => ({ ...f, phone: v }))}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
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
                    style={[styles.ctaGradient, isDarkMode ? styles.ctaGlowDark : styles.ctaGlowLight]}
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
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Create Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'password' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <Lock size={19} color={focusedField === 'password' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={(v) => setForm(f => ({ ...f, password: v }))}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
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
                              { backgroundColor: i <= strength.bars ? strength.color : (isDarkMode ? '#281B4B' : '#E2E8F0') }
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
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Confirm Password
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'confirm_password' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <Lock size={19} color={focusedField === 'confirm_password' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="Re-enter password"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      secureTextEntry={!showPassword}
                      value={form.confirm_password}
                      onChangeText={(v) => setForm(f => ({ ...f, confirm_password: v }))}
                      onFocus={() => setFocusedField('confirm_password')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Business Address & Area */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>
                    Business Area / Headquarters
                  </Text>
                  <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: focusedField === 'area' ? '#A855F7' : (isDarkMode ? '#281B4B' : '#E2E8F0') }
                  ]}>
                    <MapPin size={19} color={focusedField === 'area' ? '#A855F7' : (isDarkMode ? '#64748B' : '#94A3B8')} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputField, { color: isDarkMode ? '#F8FAFC' : '#111827' }]}
                      placeholder="e.g. Navrangpura, SG Highway, Bopal"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#9CA3AF'}
                      value={form.area}
                      onChangeText={(v) => setForm(f => ({ ...f, area: v }))}
                      onFocus={() => setFocusedField('area')}
                      onBlur={() => setFocusedField(null)}
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
                    termsAccepted ? styles.checkboxActive : (isDarkMode ? styles.checkboxInactiveDark : styles.checkboxInactiveLight)
                  ]}>
                    {termsAccepted && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.termsText, { color: isDarkMode ? '#94A3B8' : '#4B5563' }]}>
                    I accept the <Text style={{ color: isDarkMode ? '#C084FC' : '#7C3AED', fontWeight: '700' }}>Terms of Service</Text> and <Text style={{ color: isDarkMode ? '#C084FC' : '#7C3AED', fontWeight: '700' }}>Advertiser Code of Conduct</Text>.
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
                    style={[styles.ctaGradient, isDarkMode ? styles.ctaGlowDark : styles.ctaGlowLight]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.ctaButtonText}>Complete Registration 🎉</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            )}

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <View style={styles.footerSection}>
              <Text style={[styles.footerText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={[styles.signUpText, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>
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
    paddingTop: 12,
    paddingBottom: 28,
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
    fontWeight: '800',
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
    width: 18,
    height: 18,
    borderRadius: 5,
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
    borderColor: '#4C3B78',
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
    fontWeight: '700',
  },
});
