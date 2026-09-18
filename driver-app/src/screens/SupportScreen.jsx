import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, PhoneCall, Mail, AlertTriangle, FileQuestion } from 'lucide-react-native';
import ListTile from '../components/ListTile';
import PrimaryButton from '../components/PrimaryButton';

export default function SupportScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Support</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        <View className="bg-blue-600 rounded-[24px] p-6 shadow-lg shadow-blue-600/30 mb-8 items-center text-center">
          <MessageCircle size={32} color="white" className="mb-4" />
          <Text className="text-white text-xl font-black mb-2">How can we help?</Text>
          <Text className="text-blue-100 text-center text-sm font-medium mb-6">Our support team is available 24/7 to assist you with any issues.</Text>
          <PrimaryButton title="Chat with Support" className="w-full" color="bg-white" textColor="text-blue-700" />
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Contact Us</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={PhoneCall} title="Call Support" subtitle="+91 1800-123-4567" color="#10B981" />
          <ListTile icon={Mail} title="Email Support" subtitle="support@srads.in" color="#3B82F6" />
          <ListTile icon={AlertTriangle} title="Emergency Contact" subtitle="Report an accident or issue" color="#EF4444" />
        </View>

        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Resources</Text>
        <View className="bg-white rounded-3xl px-5 shadow-sm border border-slate-100 mb-8">
          <ListTile icon={FileQuestion} title="FAQs" subtitle="Find answers to common questions" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
