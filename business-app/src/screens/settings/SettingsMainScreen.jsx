import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronRight, Moon, Sun, Globe, MonitorSmartphone, 
  CreditCard, RefreshCcw, FileText, Bell, Lock, HelpCircle, LogOut, ArrowLeft 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SettingsCard from '../../components/settings/SettingsCard';
import SettingsRow from '../../components/settings/SettingsRow';
import SwitchRow from '../../components/settings/SwitchRow';
import ProfileCard from '../../components/settings/ProfileCard';
import { colors } from '../../theme/designTokens';

export default function SettingsMainScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { themePreference, isDark, setThemePreference } = useTheme();

  const [autoRecharge, setAutoRecharge] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your business account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
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
            Settings & Account
          </Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">
            Preferences & Business Profile
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <ProfileCard 
          name={user?.company_name || 'My Business'}
          businessId={`ID-${user?.id || '0000'}`}
          onPress={() => navigation.navigate('AccountDetails')}
        />

        <SettingsCard title="Appearance & Display">
          <View className="p-3.5 border-b" style={{ borderColor: isDark ? '#281B4B' : '#F1F5F9' }}>
            <View className="flex-row items-center mb-3">
              <View 
                style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
                className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
              >
                {isDark ? <Moon size={18} color="#C084FC" /> : <Sun size={18} color="#7C3AED" />}
              </View>
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-sm">Theme Mode</Text>
            </View>
            <View 
              style={{ backgroundColor: isDark ? '#0D091A' : '#F1F5F9' }}
              className="flex-row p-1 rounded-full"
            >
              {['light', 'dark', 'system'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.8}
                  onPress={() => setThemePreference(mode)}
                  style={{
                    backgroundColor: themePreference === mode ? '#7C3AED' : 'transparent',
                  }}
                  className="flex-1 py-2 rounded-full items-center"
                >
                  <Text 
                    style={{
                      color: themePreference === mode ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                      fontWeight: themePreference === mode ? '900' : '600'
                    }}
                    className="text-xs capitalize tracking-wide"
                  >
                    {mode === 'system' ? 'System' : mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <SettingsRow 
            icon={Globe} 
            title="App Language" 
            subtitle="Default: English (India)" 
            hideBorder 
          />
        </SettingsCard>

        <SettingsCard title="Wallet & Billing">
          <SettingsRow 
            icon={CreditCard} 
            title="Payment Methods" 
            subtitle="Manage saved UPI IDs & Bank Accounts" 
            onPress={() => navigation.navigate('PaymentMethods')} 
          />
          <SwitchRow 
            icon={RefreshCcw} 
            title="Auto-Recharge" 
            subtitle="Top up wallet when balance is low" 
            value={autoRecharge}
            onValueChange={setAutoRecharge}
          />
          <SettingsRow 
            icon={FileText} 
            title="GST Invoices" 
            subtitle="Monthly downloadable GST receipts" 
            onPress={() => navigation.navigate('Invoices')} 
            hideBorder
          />
        </SettingsCard>

        <SettingsCard title="Hardware Fleet">
          <SettingsRow 
            icon={MonitorSmartphone} 
            title="Linked Display Devices" 
            subtitle="Telemetry, battery & screen status" 
            onPress={() => navigation.navigate('DevicesList')} 
            hideBorder
          />
        </SettingsCard>

        <SettingsCard title="Security & Session">
          <SwitchRow 
            icon={Bell} 
            title="Push Notifications" 
            subtitle="Live playback alerts & balance updates" 
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingsRow 
            icon={Lock} 
            title="Security & Password" 
            subtitle="Update password & merchant PIN" 
          />
          <SettingsRow 
            icon={HelpCircle} 
            title="Help & Support" 
            subtitle="24/7 WhatsApp & Live Merchant Support" 
          />
          <SettingsRow 
            icon={LogOut} 
            title="Log Out" 
            subtitle="Sign out of this business account"
            onPress={handleLogout} 
            isDestructive 
            hideBorder
          />
        </SettingsCard>

        <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-center text-xs font-bold mb-10 mt-2">
          SRAds Transit Business Portal v2.4.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
