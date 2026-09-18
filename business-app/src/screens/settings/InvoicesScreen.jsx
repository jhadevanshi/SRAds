import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, FileText, Download } from 'lucide-react-native';
import { businessService } from '../../services/business';

export default function InvoicesScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getInvoices();
      if (res.success) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error('Fetch invoices error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const renderItem = ({ item }) => (
    <View className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-[#30363D] rounded-2xl p-5 mb-4 shadow-sm flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-slate-50 dark:bg-[#0D1117] rounded-xl items-center justify-center mr-4 border border-slate-100 dark:border-[#30363D]">
          <FileText size={24} className="text-slate-500 dark:text-[#8B949E]" />
        </View>
        <View className="flex-1 mr-2">
          <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{item.month}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-slate-500 dark:text-[#8B949E] text-xs font-bold mr-2">{item.id}</Text>
            <Text className="text-slate-400 dark:text-[#64748B] text-[10px] uppercase font-bold">• GST {item.gst}</Text>
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-slate-900 dark:text-white font-black text-lg mb-2">{item.amount}</Text>
        <TouchableOpacity className="bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full flex-row items-center border border-amber-200 dark:border-amber-500/30">
          <Download size={12} color="#F59E0B" />
          <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider ml-1.5">PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]">
      <View className="px-5 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117] z-10 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-[#161B22] mr-3">
            <ChevronRight size={20} className="text-slate-900 dark:text-white rotate-180" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Invoices</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-slate-500 dark:text-[#8B949E] text-base font-bold">No invoices generated yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
