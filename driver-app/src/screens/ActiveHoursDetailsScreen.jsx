import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function ActiveHoursDetailsScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-gray-100 bg-white shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Active Hours Details</Text>
      </View>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-gray-400 text-base text-center">Detailed active hours and shift logs will be available here soon.</Text>
      </View>
    </SafeAreaView>
  );
}
