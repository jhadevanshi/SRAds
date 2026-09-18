import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, PlaySquare } from 'lucide-react-native';

export default function AdvertisementHistoryScreen({ navigation }) {
  const ads = [];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10 justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Ad History</Text>
        </View>
        <TouchableOpacity className="bg-slate-100 px-4 py-2 rounded-full">
          <Text className="text-slate-900 font-bold text-xs">Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        {ads.map(ad => (
          <View key={ad.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4 flex-row items-center gap-4">
            <View className="w-16 h-16 bg-slate-100 rounded-2xl items-center justify-center">
               <PlaySquare size={24} color="#64748B" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900 text-base">{ad.name}</Text>
              <Text className="text-slate-500 font-medium text-xs mb-2">{ad.campaign}</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color="#94A3B8" />
                  <Text className="text-xs font-bold text-slate-400">{ad.duration}</Text>
                </View>
                <View className={`px-2 py-0.5 rounded-full ${ad.status === 'Active' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <Text className={`text-[10px] font-bold ${ad.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'}`}>{ad.status}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
