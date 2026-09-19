import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Plus, CreditCard, Trash2, Smartphone, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function PaymentMethodsScreen({ navigation }) {
  const { isDark } = useTheme();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getPaymentMethods();
      if (res.success) {
        setMethods(res.methods || []);
      }
    } catch (err) {
      console.error('Fetch payment methods error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchMethods);
    return unsubscribe;
  }, [navigation, fetchMethods]);

  const handleDelete = (id) => {
    Alert.alert('Remove Method', 'Are you sure you want to remove this saved payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const res = await businessService.deletePaymentMethod(id);
          if (res.success) {
            setMethods(methods.filter(m => m.id !== id));
          }
        } catch (err) {
          Alert.alert('Error', 'Failed to remove payment method');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View 
      style={{ 
        backgroundColor: isDark ? '#140F24' : '#FFFFFF',
        borderColor: isDark ? '#281B4B' : '#EDE9FE',
        shadowColor: isDark ? '#7C3AED' : '#9333EA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.15 : 0.05,
        shadowRadius: 6,
        elevation: 2
      }}
      className="border rounded-2xl p-4 mb-3.5 shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center flex-1">
          <View 
            style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
            className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
          >
            {item.type === 'UPI' ? <Smartphone size={22} color="#38bdf8" /> : <CreditCard size={22} color="#A855F7" />}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base mr-2">{item.type}</Text>
              {item.isPrimary && (
                <View 
                  style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', borderColor: '#7C3AED' }}
                  className="px-2 py-0.5 rounded-md border"
                >
                  <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-black uppercase">Primary</Text>
                </View>
              )}
            </View>
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mt-0.5">{item.details}</Text>
          </View>
        </View>
      </View>
      <View 
        style={{ borderTopColor: isDark ? '#281B4B' : '#F1F5F9' }}
        className="flex-row justify-end mt-2 pt-2.5 border-t"
      >
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-1">
          <Text className="text-rose-500 font-extrabold text-xs">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ backgroundColor: isDark ? '#090614' : '#F8F7FF' }} className="flex-1" edges={['top']}>
      {/* Header */}
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
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">Payment Methods</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Saved UPI & Bank Accounts</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={methods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 18, paddingBottom: 100 }}
          ListEmptyComponent={
            <View 
              style={{ 
                backgroundColor: isDark ? '#140F24' : '#FFFFFF',
                borderColor: isDark ? '#281B4B' : '#EDE9FE' 
              }}
              className="items-center mt-6 border rounded-3xl p-8 shadow-sm"
            >
              <CreditCard size={32} color={isDark ? '#64748B' : '#94A3B8'} className="mb-3" />
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-base font-extrabold mb-1">No Saved Methods</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs text-center">Add a UPI ID or Bank Account for fast one-tap wallet recharge.</Text>
            </View>
          }
        />
      )}

      {/* Sticky Bottom Add Button */}
      <View 
        style={{ 
          backgroundColor: isDark ? '#120C26' : '#FFFFFF',
          borderTopColor: isDark ? '#281B4B' : '#EDE9FE' 
        }}
        className="p-5 border-t"
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddPayment')}
          className="rounded-2xl overflow-hidden shadow-lg"
          style={{ shadowColor: '#9333EA', shadowRadius: 10 }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#C084FC']}
            className="py-4 flex-row items-center justify-center"
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
            <Text className="text-white font-black text-sm uppercase tracking-wide">Add Payment Method</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
