import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">About</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}>
        
        <View className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-100 items-center justify-center mb-4">
          <Text className="text-4xl font-black text-blue-600">SR</Text>
        </View>
        <Text className="text-2xl font-black text-slate-900 tracking-tight mb-1">SRAds Driver</Text>
        <Text className="text-slate-500 font-medium mb-8">Version 1.0.0 (Build 42)</Text>

        <View className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-8">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-slate-100">
            <Text className="text-sm font-bold text-slate-700">Terms of Service</Text>
            <ExternalLink size={16} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-slate-100">
            <Text className="text-sm font-bold text-slate-700">Privacy Policy</Text>
            <ExternalLink size={16} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-5">
            <Text className="text-sm font-bold text-slate-700">Open Source Licenses</Text>
            <ExternalLink size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <Text className="text-center text-slate-400 font-medium text-xs px-6 leading-5">
          © 2026 SRAds Inc. All rights reserved.{'\n'}
          Designed for performance and reliability.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
