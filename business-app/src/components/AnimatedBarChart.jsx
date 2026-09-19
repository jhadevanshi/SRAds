import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function AnimatedBarChart({ 
  data = [], 
  dataKey = '', 
  maxValue = 1, 
  title = '', 
  formatValue = (v) => v, 
  onDetailsPress = () => {}
}) {
  const { isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);

  const renderTooltip = (item, index) => {
    if (activeIndex !== index) return null;
    const value = formatValue(Number(item[dataKey]) || 0);
    return (
      <View 
        style={{ 
          backgroundColor: isDark ? '#7C3AED' : '#1E1B4B',
          shadowColor: '#9333EA',
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 6
        }}
        className="absolute -top-10 rounded-xl px-3 py-1.5 z-20 items-center shadow-lg"
      >
        <Text className="text-white text-xs font-black">{value}</Text>
        <View 
          style={{ backgroundColor: isDark ? '#7C3AED' : '#1E1B4B' }}
          className="w-2 h-2 absolute -bottom-1 rotate-45" 
        />
      </View>
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yAxisLabels = [maxValue, maxValue * 0.5, 0];

  return (
    <View 
      style={{ 
        backgroundColor: isDark ? '#140F24' : '#FFFFFF',
        borderColor: isDark ? '#281B4B' : '#EDE9FE',
        shadowColor: isDark ? '#7C3AED' : '#9333EA',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDark ? 0.2 : 0.08,
        shadowRadius: 8,
        elevation: 3
      }}
      className="p-5 rounded-3xl border mb-5 shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text style={{ color: isDark ? '#F8FAFC' : '#1E1B4B' }} className="font-extrabold text-base tracking-tight">{title}</Text>
        <TouchableOpacity onPress={onDetailsPress}>
          <Text style={{ color: isDark ? '#C084FC' : '#7C3AED' }} className="text-xs font-bold uppercase tracking-wider">Details</Text>
        </TouchableOpacity>
      </View>
      
      {data.length === 0 ? (
        <Text style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-xs font-medium text-center py-8">No broadcast activity recorded</Text>
      ) : (
        <View className="flex-row h-48 pt-2">
          {/* Y Axis */}
          <View 
            style={{ borderRightColor: isDark ? '#281B4B' : '#EDE9FE' }}
            className="justify-between items-end pr-3 pb-6 border-r"
          >
            {yAxisLabels.map((val, i) => (
              <Text key={i} style={{ color: isDark ? '#64748B' : '#94A3B8' }} className="text-[10px] font-bold">
                {formatValue(val)}
              </Text>
            ))}
          </View>

          {/* Chart Bars */}
          <View className="flex-1 flex-row items-end justify-between pl-2">
            {/* Grid Lines */}
            <View style={{ borderBottomColor: isDark ? '#281B4B' : '#F1F5F9' }} className="absolute inset-0 border-b top-0" />
            <View style={{ borderBottomColor: isDark ? '#281B4B' : '#F1F5F9' }} className="absolute inset-0 border-b top-1/2" />
            <View style={{ borderBottomColor: isDark ? '#281B4B' : '#F1F5F9' }} className="absolute inset-0 border-b bottom-6" />

            {data.map((d, i) => {
              const val = Number(d[dataKey]) || 0;
              const heightPct = Math.max((val / (maxValue || 1)) * 100, 4); 
              
              let isToday = false;
              let displayLabel = d.label || '';
              
              if (d.date) {
                try {
                  const dDateStr = new Date(d.date).toISOString().split('T')[0];
                  isToday = dDateStr === todayStr;
                  if (!displayLabel) {
                    displayLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' });
                  }
                } catch (e) {}
              }

              return (
                <View key={i} className="items-center flex-1 h-full justify-end relative">
                  {renderTooltip(d, i)}
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setActiveIndex(activeIndex === i ? null : i)}
                    className="w-full h-full items-center justify-end pb-6 z-10"
                  >
                    <View className="w-full max-w-[20px] h-full justify-end rounded-t-lg overflow-hidden">
                      <LinearGradient
                        colors={isToday ? ['#C084FC', '#7C3AED'] : (isDark ? ['#6D28D9', '#3B0764'] : ['#C4B5FD', '#8B5CF6'])}
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg ${activeIndex === i ? 'opacity-100' : 'opacity-85'}`}
                      />
                    </View>
                  </TouchableOpacity>
                  <Text 
                    style={{ 
                      color: isToday ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? '#64748B' : '#94A3B8'),
                      fontWeight: isToday ? '800' : '600'
                    }} 
                    className="absolute bottom-0 text-[10px]" 
                    numberOfLines={1}
                  >
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
