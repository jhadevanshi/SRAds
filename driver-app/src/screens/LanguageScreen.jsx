import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from '../components/PrimaryButton';

const LANGUAGES = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export default function LanguageScreen({ navigation }) {
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    const loadLang = async () => {
      const saved = await AsyncStorage.getItem('srads_language');
      if (saved) setSelected(saved);
    };
    loadLang();
  }, []);

  const handleSave = async () => {
    await AsyncStorage.setItem('srads_language', selected);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 py-4 flex-row items-center border-b border-slate-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#0F172A] ml-2 tracking-tight">Language</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Select Language</Text>
        
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-8">
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity 
              key={lang.id}
              onPress={() => setSelected(lang.id)}
              className={`flex-row items-center justify-between p-5 ${index !== LANGUAGES.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <View>
                <Text className="text-base font-bold text-slate-900 mb-1">{lang.nativeName}</Text>
                <Text className="text-xs text-slate-500 font-medium">{lang.name}</Text>
              </View>
              {selected === lang.id && (
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center">
                  <Check size={14} color="#2563EB" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton 
          title="Save Preference" 
          onPress={handleSave} 
          color="bg-slate-900" 
        />
      </ScrollView>
    </SafeAreaView>
  );
}
