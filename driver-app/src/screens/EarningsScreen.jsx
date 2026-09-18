import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wallet, Landmark, RefreshCcw } from 'lucide-react-native';
import FloatingBottomNav from '../components/FloatingBottomNav';
import ListTile from '../components/ListTile';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';

import { useNavigation } from '@react-navigation/native';

export default function EarningsScreen(props) {
  const navigation = props.navigation || useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ today: 0, week: 0, balance: 0 });
  const [bank, setBank] = useState(null);

  const fetchEarnings = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [earnRes, dashRes, bankRes] = await Promise.all([
        api.get('/driver/earnings'),
        api.get('/driver/dashboard'),
        api.get('/driver/payment-methods')
      ]);
      setTransactions(earnRes.data.earnings || []);
      
      const dashboard = dashRes.data.dashboard;
      setTotals({
        today: dashboard?.today?.income || 0,
        week: dashboard?.history?.this_week || 0,
        balance: dashboard?.history?.lifetime || 0
      });
      
      const primaryBank = bankRes.data.paymentMethods?.find(b => b.is_primary) || bankRes.data.paymentMethods?.[0];
      setBank(primaryBank);
    } catch (e) {
      if (e.response?.status !== 401) console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Earnings</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-6" 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchEarnings(true)} />}
      >
        
        {/* Wallet Balance Card */}
        <View className="bg-emerald-600 rounded-[24px] p-6 shadow-lg shadow-emerald-600/30 mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <Wallet size={20} color="#D1FAE5" />
            <Text className="text-emerald-100 font-bold uppercase tracking-wider text-xs">Wallet Balance</Text>
          </View>
          <Text className="text-white text-5xl font-black tracking-tighter mb-6">₹{Number(totals.balance).toFixed(2)}</Text>
          
          <View className="flex-row gap-4">
            <PrimaryButton 
              title="Request Payout" 
              className="flex-1" 
              color="bg-white" 
              textColor="text-emerald-700" 
            />
          </View>
        </View>

        {/* Mini Stats */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Today</Text>
            <Text className="text-slate-900 text-2xl font-black">₹{Number(totals.today).toFixed(2)}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">This Week</Text>
            <Text className="text-slate-900 text-2xl font-black">₹{Number(totals.week).toFixed(2)}</Text>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Linked Accounts</Text>
          <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100">
            {bank ? (
               <ListTile icon={Landmark} title={bank.bank_name || 'Bank Account'} subtitle={`**** **** ${String(bank.account_number).slice(-4)}`} color="#10B981" onPress={() => navigation.navigate('PaymentMethods')} />
            ) : (
               <ListTile icon={Landmark} title="No Bank Linked" subtitle="Tap to link account" color="#EF4444" onPress={() => navigation.navigate('PaymentMethods')} />
            )}
            <ListTile icon={RefreshCcw} title="Manage Payouts" subtitle="View and edit linked accounts" color="#64748B" onPress={() => navigation.navigate('PaymentMethods')} />
          </View>
        </View>

        <Text className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Recent Transactions</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100">
          {transactions.length > 0 ? transactions.map((t, idx) => (
            <View key={t.id} className={`py-4 flex-row justify-between items-center ${idx !== transactions.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <View>
                <Text className="text-slate-900 font-bold text-base">{t.description}</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <Text className={`font-bold text-base ${t.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                +₹{Number(t.amount).toFixed(2)}
              </Text>
            </View>
          )) : (
            <View className="py-6 items-center">
                <Text className="text-slate-400 font-bold">No transactions found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingBottomNav />
    </SafeAreaView>
  );
}
