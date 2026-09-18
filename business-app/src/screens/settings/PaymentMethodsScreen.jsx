import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Plus, CreditCard, Trash2, Smartphone } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function PaymentMethodsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getPaymentMethods();
      if (res.success) {
        setMethods(res.methods);
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
    Alert.alert('Remove Payment Method', 'Are you sure you want to remove this payment method?', [
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
    <View className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#30363D] rounded-2xl p-5 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-1">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-slate-50 dark:bg-[#0D1117] rounded-xl items-center justify-center mr-4 border border-slate-100 dark:border-[#30363D]">
            {item.type === 'UPI' ? <Smartphone size={24} color="#38bdf8" /> : <CreditCard size={24} color="#8b5cf6" />}
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-slate-900 dark:text-white font-black text-lg mr-2">{item.type}</Text>
              {item.isPrimary && (
                <View className="bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-200 dark:border-amber-500/30">
                  <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">Primary</Text>
                </View>
              )}
            </View>
            <Text className="text-slate-500 dark:text-[#8B949E] text-sm font-bold mt-0.5">{item.details}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row justify-end mt-2 pt-3 border-t border-slate-100 dark:border-[#30363D]">
        <TouchableOpacity className="mr-6">
          <Text className="text-[#F59E0B] font-bold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text className="text-red-500 font-bold">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
          <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Methods</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={methods}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-slate-500 dark:text-[#8B949E] text-base font-bold">No payment methods linked.</Text>
            </View>
          }
        />
      )}

      <View className="absolute bottom-0 left-0 right-0 p-5 bg-[#F8FAFC]/90 dark:bg-[#0D1117]/90 border-t border-slate-100 dark:border-[#30363D]">
        <TouchableOpacity 
          className="bg-[#F59E0B] rounded-2xl py-4 flex-row items-center justify-center shadow-md shadow-amber-500/20"
          onPress={() => navigation.navigate('AddPayment')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="text-white font-black text-lg tracking-tight ml-2">Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
