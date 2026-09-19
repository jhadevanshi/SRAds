import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Camera, ArrowLeft, Building2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { businessService } from '../../services/business';
import { colors } from '../../theme/designTokens';

const InputField = React.memo(({ label, value, onChangeText, keyboardType = 'default', editable = true, isDark }) => (
  <View className="mb-4">
    <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-bold uppercase tracking-wider mb-2 ml-1">
      {label}
    </Text>
    <TextInput
      style={{ 
        backgroundColor: isDark ? '#140F24' : '#FFFFFF',
        borderColor: isDark ? '#281B4B' : '#EDE9FE',
        color: !editable ? (isDark ? '#64748B' : '#94A3B8') : (isDark ? '#F8FAFC' : '#1E1B4B') 
      }}
      className="border rounded-2xl px-4 py-3.5 font-bold shadow-sm text-sm"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
      editable={editable}
    />
  </View>
));

export default function AccountDetailsScreen({ navigation }) {
  const { isDark } = useTheme();
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    businessName: user?.company_name || '',
    ownerName: user?.owner_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gstin: user?.gst || '',
    address: user?.address || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await businessService.updateProfile(form);
      if (res.success) {
        setUser({
          ...user,
          ...res.business
        });
        Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      {/* Top Header */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderBottomColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="px-5 py-4 border-b z-10 flex-row items-center"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            backgroundColor: isDark ? '#1F1735' : '#F8F7FF',
            borderColor: isDark ? '#281B4B' : '#EDE9FE' 
          }}
          className="p-2.5 rounded-full border mr-3"
        >
          <ArrowLeft size={18} color={isDark ? '#F8FAFC' : '#1E1B4B'} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">
            Business Profile
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">
            Merchant KYC & Contact Info
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 110 }}>
        
        {/* Avatar */}
        <View className="items-center mb-6">
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="w-20 h-20 rounded-3xl items-center justify-center shadow-lg mb-2 relative"
            style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
          >
            <Building2 size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="font-extrabold text-xs">
            Merchant ID #{user?.id || '0000'}
          </Text>
        </View>

        <InputField isDark={isDark} label="Business Entity Name" value={form.businessName} onChangeText={(t) => setForm({...form, businessName: t})} />
        <InputField isDark={isDark} label="Authorised Representative" value={form.ownerName} onChangeText={(t) => setForm({...form, ownerName: t})} />
        <InputField isDark={isDark} label="Work Email" value={form.email} onChangeText={(t) => setForm({...form, email: t})} keyboardType="email-address" />
        <InputField isDark={isDark} label="Mobile Phone" value={form.phone} onChangeText={(t) => setForm({...form, phone: t})} keyboardType="phone-pad" />
        <InputField isDark={isDark} label="GSTIN (Verified)" value={form.gstin} onChangeText={(t) => setForm({...form, gstin: t})} editable={false} />
        <InputField isDark={isDark} label="Registered Billing Address" value={form.address} onChangeText={(t) => setForm({...form, address: t})} />

      </ScrollView>

      {/* Sticky Bottom Save */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="p-5 border-t"
      >
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ shadowColor: '#9333EA', shadowRadius: 10, opacity: saving ? 0.6 : 1 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="py-4 items-center justify-center flex-row"
          >
            {saving ? <ActivityIndicator color="#FFFFFF" className="mr-2" size="small" /> : null}
            <Text className="text-white font-black text-sm uppercase tracking-wide">Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
