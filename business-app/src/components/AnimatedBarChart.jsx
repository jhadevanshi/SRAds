import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function AnimatedBarChart({ 
  data = [], 
  dataKey = '', 
  maxValue = 1, 
  title = '', 
  formatValue = (v) => v, 
  barColor = 'bg-blue-200', 
  activeBarColor = 'bg-blue-500',
  onDetailsPress = () => {}
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const renderTooltip = (item, index) => {
    if (activeIndex !== index) return null;
    const value = formatValue(Number(item[dataKey]) || 0);
    return (
      <View className="absolute -top-10 bg-[#0F172A] dark:bg-white rounded-lg px-3 py-1.5 shadow-md z-10 items-center">
        <Text className="text-white dark:text-[#0F172A] text-xs font-bold whitespace-nowrap">{value}</Text>
        <View className="w-2 h-2 bg-[#0F172A] dark:bg-white absolute -bottom-1 rotate-45" />
      </View>
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Create Y-axis labels
  const yAxisLabels = [maxValue, maxValue * 0.5, 0];

  return (
    <View className="bg-white dark:bg-[#161B22] p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-[#30363D] mb-5">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="font-bold text-slate-900 dark:text-white text-lg">{title}</Text>
        <TouchableOpacity onPress={onDetailsPress}>
          <Text className="text-sm font-bold text-blue-600">View Details</Text>
        </TouchableOpacity>
      </View>
      
      {data.length === 0 ? (
        <Text className="text-sm text-slate-400 text-center py-8">No data available</Text>
      ) : (
        <View className="flex-row h-48 pt-2">
          {/* Y Axis */}
          <View className="justify-between items-end pr-3 pb-6 border-r border-slate-100">
            {yAxisLabels.map((val, i) => (
              <Text key={i} className="text-[10px] font-bold text-slate-400">
                {formatValue(val)}
              </Text>
            ))}
          </View>

          {/* Chart Area */}
          <View className="flex-1 flex-row items-end justify-between pl-2">
            {/* Background Grid Lines */}
            <View className="absolute inset-0 border-b border-slate-100 dark:border-[#30363D] top-0" />
            <View className="absolute inset-0 border-b border-slate-100 dark:border-[#30363D] top-1/2" />
            <View className="absolute inset-0 border-b border-slate-100 dark:border-[#30363D] bottom-6" />

            {data.map((d, i) => {
              const val = Number(d[dataKey]) || 0;
              const heightPct = Math.max((val / (maxValue || 1)) * 100, 2); 
              
              let isToday = false;
              let displayLabel = d.label || '';
              
              if (d.date) {
                try {
                  const dDateStr = new Date(d.date).toISOString().split('T')[0];
                  isToday = dDateStr === todayStr;
                  if (!displayLabel) {
                    displayLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' });
                  }
                } catch (e) {
                  // Fallback if date is invalid
                }
              }

              return (
                <View key={i} className="items-center flex-1 h-full justify-end relative">
                  {renderTooltip(d, i)}
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setActiveIndex(activeIndex === i ? null : i)}
                    className="w-full h-full items-center justify-end pb-6 z-10"
                  >
                    <View className="w-full max-w-[24px] h-full justify-end rounded-t-lg">
                      <View 
                        className={`w-full rounded-t-lg ${isToday ? activeBarColor : barColor} ${activeIndex === i ? 'opacity-100' : 'opacity-80'}`} 
                        style={{ height: `${heightPct}%` }}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text className={`absolute bottom-0 text-[9px] ${isToday ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400 font-bold'}`} numberOfLines={1}>
                    {displayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
