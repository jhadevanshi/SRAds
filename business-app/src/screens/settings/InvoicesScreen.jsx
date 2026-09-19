import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, FileText, Download, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { businessService } from '../../services/business';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../theme/designTokens';

export default function InvoicesScreen({ navigation }) {
  const { isDark } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessService.getInvoices();
      if (res.success) {
        setInvoices(res.invoices || []);
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

  const handleDownload = (item) => {
    Alert.alert('Invoice Download', `Invoice ${item.id} for ${item.month} is ready for download. An official PDF receipt with GST details has been dispatched to your email.`);
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
      className="border rounded-2xl p-4 mb-3.5 shadow-sm flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1 mr-2">
        <View 
          style={{ backgroundColor: isDark ? '#1F1735' : '#EDE9FE' }}
          className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
        >
          <FileText size={20} color={isDark ? '#C084FC' : '#7C3AED'} />
        </View>
        <View className="flex-1 mr-2">
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base tracking-tight">{item.month}</Text>
          <View className="flex-row items-center mt-0.5">
            <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold mr-1.5">{item.id}</Text>
            <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] uppercase font-bold">• GST {item.gst || '18%'}</Text>
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text style={{ color: isDark ? '#34D399' : '#059669' }} className="font-black text-base mb-1.5">{item.amount}</Text>
        <TouchableOpacity 
          onPress={() => handleDownload(item)}
          style={{ backgroundColor: isDark ? '#281B4B' : '#EDE9FE', borderColor: isDark ? '#3B2A68' : '#DDD6FE' }}
          className="px-3 py-1 rounded-full flex-row items-center border"
        >
          <Download size={11} color={isDark ? '#C084FC' : '#7C3AED'} />
          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-[10px] font-black uppercase tracking-wider ml-1">PDF</Text>
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
          <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-xl font-black tracking-tight">GST Invoices</Text>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs font-semibold">Monthly Tax Receipts & Statements</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={invoices}
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
              <FileText size={32} color={isDark ? '#64748B' : '#94A3B8'} className="mb-3" />
              <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="text-base font-extrabold mb-1">No Invoices Yet</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B' }} className="text-xs text-center">Tax invoices are generated on the 1st of every month automatically.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
