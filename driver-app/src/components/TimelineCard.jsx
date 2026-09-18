import React from 'react';
import { View, Text } from 'react-native';

export default function TimelineCard({ events = [] }) {
  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
      {events.map((event, idx) => (
        <View key={idx} className="flex-row gap-4 mb-5 last:mb-0">
          <View className="items-center">
            <View className={`w-3 h-3 rounded-full border-2 ${event.color || 'bg-blue-500 border-blue-100'}`} />
            {idx !== events.length - 1 && (
              <View className="w-[2px] h-full bg-slate-100 absolute top-3" />
            )}
          </View>
          <View className="flex-1 -mt-1.5 pb-2">
            <Text className="text-xs font-bold text-slate-400 mb-0.5">{event.time}</Text>
            <Text className="text-sm font-bold text-slate-900">{event.title}</Text>
            {event.subtitle && <Text className="text-xs text-slate-500 mt-0.5">{event.subtitle}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}
