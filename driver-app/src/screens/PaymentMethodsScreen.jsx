import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Landmark, Plus, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react-native';
import api from '../services/api';
import PrimaryButton from '../components/PrimaryButton';

export default function PaymentMethodsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await api.get('/driver/payment-methods');
        setMethods(res.data.paymentMethods);
      } catch (err) {
        Alert.alert('Error', 'Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchMethods);
    fetchMethods();
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id) => {
    Alert.alert(
      "Remove Bank",
      "Are you sure you want to remove this bank account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/driver/payment-methods/${id}`);
              setMethods(methods.filter(m => m.id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to remove bank');
            }
          }
        }
      ]
    );
  };

  const setPrimary = async (id) => {
    try {
      await api.put(`/driver/payment-methods/${id}`);
      setMethods(methods.map(m => ({ ...m, is_primary: m.id === id })));
    } catch (err) {
      Alert.alert('Error', 'Failed to set primary bank');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Payment Methods</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddBank')} className="p-2 rounded-full bg-blue-50">
          <Plus size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {methods.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center mb-6">
              <Landmark size={40} color="#94A3B8" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">No bank account linked</Text>
            <Text className="text-center text-slate-500 mb-8 px-6">
              Add a bank account to receive payouts for your advertisement trips.
            </Text>
            <PrimaryButton 
              title="+ Add Bank Account" 
              onPress={() => navigation.navigate('AddBank')} 
              color="bg-blue-600" 
              className="w-full"
            />
          </View>
        ) : (
          <View>
            <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Linked Banks</Text>
            {methods.map(bank => (
              <View key={bank.id} className={`bg-white rounded-3xl p-5 shadow-sm border mb-4 ${bank.is_primary ? 'border-emerald-500' : 'border-slate-100'}`}>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${bank.is_primary ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <Landmark size={20} color={bank.is_primary ? '#10B981' : '#64748B'} />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-900">{bank.bank_name}</Text>
                      <Text className="text-xs text-slate-500 font-medium">**** **** {bank.account_number.slice(-4)}</Text>
                    </View>
                  </View>
                  {bank.status === 'Verified' ? (
                    <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text className="text-[10px] font-bold text-emerald-700 uppercase">Verified</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                      <ShieldAlert size={12} color="#F59E0B" />
                      <Text className="text-[10px] font-bold text-amber-700 uppercase">Pending</Text>
                    </View>
                  )}
                </View>
                
                <View className="bg-slate-50 rounded-xl p-3 mb-4">
                  <Text className="text-xs text-slate-500 font-medium mb-1">Account Holder</Text>
                  <Text className="text-sm font-bold text-slate-900 uppercase">{bank.account_holder}</Text>
                </View>

                <View className="flex-row justify-between items-center border-t border-slate-100 pt-4">
                  <TouchableOpacity 
                    disabled={bank.is_primary}
                    onPress={() => setPrimary(bank.id)}
                  >
                    <Text className={`font-bold text-sm ${bank.is_primary ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {bank.is_primary ? 'Primary Account' : 'Set as Primary'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(bank.id)} className="flex-row items-center gap-1 p-2">
                    <Trash2 size={16} color="#EF4444" />
                    <Text className="text-red-500 font-bold text-xs uppercase">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
