import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Appearance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronRight, Moon, Sun, Globe, MonitorSmartphone, 
  CreditCard, RefreshCcw, FileText, Bell, Lock, HelpCircle, LogOut 
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SettingsCard from '../../components/settings/SettingsCard';
import SettingsRow from '../../components/settings/SettingsRow';
import SwitchRow from '../../components/settings/SwitchRow';
import ProfileCard from '../../components/settings/ProfileCard';

export default function SettingsMainScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { themePreference, isDarkMode, setThemePreference } = useTheme();

  const [autoRecharge, setAutoRecharge] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your business account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
          <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings & Preferences</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-2" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <ProfileCard 
          name={user?.company_name || 'My Business'}
          businessId={`ID-${user?.id || '0000'}`}
          onPress={() => navigation.navigate('AccountDetails')}
        />

        <SettingsCard title="Appearance">
          <View className="p-4 border-b border-slate-100 dark:border-[#30363D]">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#0D1117] items-center justify-center mr-4">
                {isDarkMode ? <Moon size={20} color="#8B949E" /> : <Sun size={20} color="#64748B" />}
              </View>
              <Text className="font-bold text-base text-slate-900 dark:text-white">Theme Mode</Text>
            </View>
            <View className="flex-row bg-slate-100 dark:bg-[#0D1117] p-1 rounded-full">
              {['light', 'dark', 'system'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  activeOpacity={0.8}
                  onPress={() => setThemePreference(mode)}
                  className={`flex-1 py-2.5 rounded-full items-center ${themePreference === mode ? 'bg-white dark:bg-[#30363D] shadow-sm' : ''}`}
                >
                  <Text className={`font-bold text-xs capitalize tracking-wide ${themePreference === mode ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#8B949E]'}`}>
                    {mode === 'system' ? 'System Default' : mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <SettingsRow 
            icon={Globe} 
            title="App Language" 
            subtitle="Current: English" 
            hideBorder 
          />
        </SettingsCard>

        <SettingsCard title="Wallet & Billing">
          <SettingsRow 
            icon={CreditCard} 
            title="Payment Methods" 
            subtitle="Show linked payment methods" 
            onPress={() => navigation.navigate('PaymentMethods')} 
          />
          <SwitchRow 
            icon={RefreshCcw} 
            title="Auto-Recharge" 
            subtitle="Add funds when below ₹100" 
            value={autoRecharge}
            onValueChange={setAutoRecharge}
          />
          <SettingsRow 
            icon={FileText} 
            title="Invoices" 
            subtitle="Monthly downloadable invoices" 
            onPress={() => navigation.navigate('Invoices')} 
            hideBorder
          />
        </SettingsCard>

        <SettingsCard title="Hardware">
          <SettingsRow 
            icon={MonitorSmartphone} 
            title="Linked Display Devices" 
            subtitle="View status and manage displays" 
            onPress={() => navigation.navigate('DevicesList')} 
            hideBorder
          />
        </SettingsCard>

        <SettingsCard title="Preferences & Security">
          <SwitchRow 
            icon={Bell} 
            title="Notifications" 
            subtitle="Low Wallet, Ad Approvals" 
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingsRow 
            icon={Lock} 
            title="Security" 
            subtitle="Change Password & PIN" 
          />
          <SettingsRow 
            icon={HelpCircle} 
            title="Support" 
            subtitle="Live Chat, WhatsApp, Terms" 
          />
          <SettingsRow 
            icon={LogOut} 
            title="Logout" 
            onPress={handleLogout} 
            isDestructive 
            hideBorder
          />
        </SettingsCard>

        <Text className="text-center text-slate-400 dark:text-[#8B949E] text-xs font-bold mb-10">SRAds Business Portal v2.4.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
