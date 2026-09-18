import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SectionList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Info, Plus, X, ArrowUpRight, ArrowDownRight, Tag, Megaphone, Calendar, Receipt, PlayCircle } from 'lucide-react-native';

const aggregateTransactions = (transactions) => {
  if (!transactions) return [];
  const aggregated = [];
  const playbacksByDayAndAd = {};

  transactions.forEach(txn => {
    const isPlayback = txn.type === 'Debit' && txn.reason && txn.reason.includes('Playback deduction');
    
    if (isPlayback) {
      const date = new Date(txn.created_at);
      const dateMidnight = new Date(date).setHours(0,0,0,0);
      const adName = txn.ad_title || 'Ad Creative';
      const campName = txn.campaign_name || 'General Playback';
      const key = `${dateMidnight}_${adName}_${campName}`;
      
      if (!playbacksByDayAndAd[key]) {
        playbacksByDayAndAd[key] = {
          id: `grouped_${key}`,
          type: 'Debit',
          amount: 0,
          count: 0,
          ad_title: adName,
          campaign_name: campName,
          created_at: txn.created_at,
          reason: 'Playback deduction',
          isGrouped: true
        };
      }
      playbacksByDayAndAd[key].amount += parseFloat(txn.amount);
      playbacksByDayAndAd[key].count += 1;
      if (new Date(txn.created_at) > new Date(playbacksByDayAndAd[key].created_at)) {
        playbacksByDayAndAd[key].created_at = txn.created_at;
      }
    } else {
      aggregated.push({
        ...txn,
        isGrouped: false
      });
    }
  });
  
  Object.keys(playbacksByDayAndAd).forEach(key => {
    aggregated.push(playbacksByDayAndAd[key]);
  });
  
  aggregated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return aggregated;
};

const groupTransactions = (transactions) => {
  const groups = {};
  const today = new Date().setHours(0,0,0,0);
  const yesterday = new Date(today - 86400000).getTime();

  transactions.forEach(txn => {
    const date = new Date(txn.created_at);
    const timeAtMidnight = new Date(date).setHours(0,0,0,0);
    
    let label = '';
    if (timeAtMidnight === today) {
      label = 'TODAY';
    } else if (timeAtMidnight === yesterday) {
      label = 'YESTERDAY';
    } else {
      label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(txn);
  });

  return Object.keys(groups).map(title => ({
    title,
    data: groups[title]
  }));
};

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState({ transactions: [], totalSpent: 0, totalAdded: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [quickAmount, setQuickAmount] = useState('500');

  const fetchWallet = useCallback(async () => {
    try {
      const res = await businessService.getWallet();
      if (res.success) {
        setWalletData({
          transactions: res.transactions,
          totalSpent: parseFloat(res.total_spent || 0),
          totalAdded: parseFloat(res.total_added || 0),
          balance: parseFloat(res.wallet_balance || 0)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [fetchWallet])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchWallet();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchWallet]);

  const handleAddMoney = () => {
    navigation.navigate('AddMoney', { amount: quickAmount });
  };

  const formatTxnText = (item) => {
    const isCredit = item.type === 'Credit';
    if (isCredit) {
      if (item.reason === 'Funds added by Admin') {
        return { 
          title: 'Administrative Credit', 
          subtitle: 'Added by SRAds Admin',
          icon: Wallet,
          color: 'emerald'
        };
      }
      const refText = item.cashfree_order_id ? `Ref: #${item.cashfree_order_id.slice(-8)}` : 'Instant Recharge';
      return { 
        title: 'Wallet Top-up', 
        subtitle: `via UPI • ${refText}`,
        icon: ArrowDownRight,
        color: 'emerald'
      };
    } else {
      if (item.isGrouped) {
        return { 
          title: 'Advertisement Spending', 
          subtitle: `${item.ad_title} • ${item.count} play${item.count > 1 ? 's' : ''}`,
          icon: PlayCircle,
          color: 'slate'
        };
      }
      if (item.reason.includes('Playback deduction')) {
        const adName = item.ad_title || 'Ad Creative';
        const campName = item.campaign_name ? `Ad: ${item.campaign_name}` : 'General Playback';
        return { 
          title: 'Ad Playback Spend', 
          subtitle: `${adName} • ${campName}`,
          icon: PlayCircle,
          color: 'slate'
        };
      }
      return { 
        title: 'Ad Charge', 
        subtitle: item.reason || 'Advertising spend',
        icon: ArrowUpRight,
        color: 'slate'
      };
    }
  };

  const renderItem = ({ item }) => {
    const isCredit = item.type === 'Credit';
    const date = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const { title, subtitle, icon: TxnIcon, color: iconColor } = formatTxnText(item);

    return (
      <TouchableOpacity 
        onPress={() => setSelectedTxn(item)}
        activeOpacity={0.7}
        className="flex-row justify-between items-center py-4 border-b border-slate-100 dark:border-[#1F2937]"
      >
        <View className="flex-1 mr-4 flex-row items-center">
          {/* LEFT: Icon Badge */}
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <TxnIcon size={18} className={iconColor === 'emerald' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'} />
          </View>
          
          {/* MIDDLE: Text Context */}
          <View className="flex-1">
            <Text className="text-slate-900 dark:text-white font-bold text-sm tracking-tight mb-0.5">{title}</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1" numberOfLines={1}>{subtitle}</Text>
            <Text className="text-slate-400 dark:text-slate-600 text-[9px] font-bold tracking-wider">{date} · {time}</Text>
          </View>
        </View>

        {/* RIGHT: Amount */}
        <View className="items-end">
          <View className={`px-2.5 py-1 rounded-full ${isCredit ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50 dark:bg-slate-800/30'}`}>
            <Text className={`font-black text-sm ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
              {isCredit ? '+' : '−'}₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const aggregated = aggregateTransactions(walletData.transactions);
  const sections = groupTransactions(aggregated);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] dark:bg-[#0D1117]" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0D1117] z-10">
        <Text className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Wallet & Billing</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-[#F8FAFC] dark:bg-[#0D1117] pt-6 pb-2">
            <Text className="text-slate-400 dark:text-[#8B949E] text-[10px] font-black uppercase tracking-widest">
              {title}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
        ListHeaderComponent={
          <View className="pt-6 pb-2">
            
            {/* Balance Summary Card */}
            <View className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-[24px] p-6 shadow-sm mb-6">
              
              {/* Header Context */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  AVAILABLE AD BALANCE
                </Text>
                
                {walletData.balance > 0 ? (
                  <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      Ready for Ads
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-500/20">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                    <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                      No Funds
                    </Text>
                  </View>
                )}
              </View>

              {/* Main Balance */}
              <Text className="text-slate-900 dark:text-white text-4xl font-black tracking-tighter mb-5">
                ₹{walletData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>

              {/* Add Funds Button */}
              <TouchableOpacity 
                className="bg-[#F59E0B] py-4 rounded-2xl flex-row items-center w-full justify-center mb-5 active:scale-[0.98] shadow-sm"
                onPress={handleAddMoney}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={3.5} />
                <Text className="text-white font-black text-base ml-2 tracking-tight">Add Funds</Text>
              </TouchableOpacity>

              {/* Quick top-up chips */}
              <View className="flex-row justify-between mb-6">
                {['500', '1000', '2000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => setQuickAmount(amt)}
                    className={`flex-1 mx-1 py-2.5 rounded-xl border items-center justify-center ${quickAmount === amt ? 'bg-amber-50 dark:bg-amber-500/10 border-[#F59E0B]' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-[#30363D]'}`}
                  >
                    <Text className={`text-xs font-black ${quickAmount === amt ? 'text-[#F59E0B]' : 'text-slate-600 dark:text-slate-400'}`}>
                      +₹{parseInt(amt).toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setQuickAmount('')}
                  className={`flex-1 mx-1 py-2.5 rounded-xl border items-center justify-center ${quickAmount === '' ? 'bg-amber-50 dark:bg-amber-500/10 border-[#F59E0B]' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-[#30363D]'}`}
                >
                  <Text className={`text-xs font-black ${quickAmount === '' ? 'text-[#F59E0B]' : 'text-slate-600 dark:text-slate-400'}`}>
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider and stats metrics */}
              <View className="flex-row border-t border-slate-100 dark:border-[#1F2937] pt-5">
                <View className="flex-1 items-center border-r border-slate-100 dark:border-[#1F2937]">
                  <Text className="text-slate-450 dark:text-slate-550 text-[9px] font-black uppercase tracking-wider mb-1">TOTAL ADDED</Text>
                  <Text className="text-slate-800 dark:text-slate-200 font-black text-sm">
                    ₹{walletData.totalAdded.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-slate-450 dark:text-slate-550 text-[9px] font-black uppercase tracking-wider mb-1">SPENT ON ADS</Text>
                  <Text className="text-slate-800 dark:text-slate-200 font-black text-sm">
                    ₹{walletData.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Low Balance Warning Alert */}
            {walletData.balance < 500 && (
              <View className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex-row items-start gap-2.5">
                <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-amber-800 dark:text-amber-300 font-bold text-xs">
                    Your advertising balance is running low.
                  </Text>
                  <Text className="text-amber-600 dark:text-amber-400 text-[11px] font-medium mt-0.5">
                    Add funds to keep your ads running.
                  </Text>
                </View>
              </View>
            )}

            <Text className="text-slate-900 dark:text-white font-black text-lg tracking-tight mt-2 mb-2">Recent Activity</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="mt-10 items-center"><ActivityIndicator color="#F59E0B" /></View>
          ) : (
            <View className="items-center mt-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-[24px] p-8 shadow-sm">
              <View className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full items-center justify-center mb-5">
                <Wallet size={28} className="text-emerald-500" />
              </View>
              <Text className="text-slate-900 dark:text-white text-lg font-black tracking-tight mb-2 text-center">No wallet activity yet</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6 px-4">
                Your funds and advertising charges will appear here.
              </Text>
            </View>
          )
        }
      />

      {/* Transaction Detail Modal */}
      <Modal visible={!!selectedTxn} transparent animationType="fade" onRequestClose={() => setSelectedTxn(null)}>
        <View className="flex-1 justify-end bg-slate-900/60 dark:bg-black/80">
          <View className="bg-white dark:bg-[#161B22] rounded-t-[32px] p-6 pb-12 shadow-2xl border-t border-slate-100 dark:border-[#30363D]">
            
            {/* Drag Handle Bar */}
            <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full self-center mb-6" />

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Transaction Detail</Text>
              <TouchableOpacity onPress={() => setSelectedTxn(null)} className="p-2 bg-slate-100 dark:bg-[#30363D] rounded-full">
                <X size={18} className="text-slate-500 dark:text-[#8B949E]" />
              </TouchableOpacity>
            </View>

            {selectedTxn && (() => {
              const isCredit = selectedTxn.type === 'Credit';
              const { title, subtitle } = formatTxnText(selectedTxn);
              return (
                <View>
                  <View className="items-center mb-8">
                    <Text className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">Amount</Text>
                    <Text className={`text-4xl font-black tracking-tighter ${isCredit ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {isCredit ? '+' : '−'}₹{parseFloat(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View className="bg-slate-50 dark:bg-[#0D1117] rounded-2xl p-5 border border-slate-100 dark:border-[#30363D]">
                    
                    <View className="flex-row justify-between items-center mb-4">
                      <View className="flex-row items-center">
                        <Receipt size={16} className="text-slate-400 dark:text-slate-550 mr-2" />
                        <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Transaction Type</Text>
                      </View>
                      <Text className="text-slate-900 dark:text-white font-black text-sm">{title}</Text>
                    </View>

                    {selectedTxn.type === 'Debit' && selectedTxn.reason.includes('Playback') ? (
                      <>
                        <View className="flex-row justify-between items-center mb-4 border-t border-slate-200/60 dark:border-slate-800 pt-4">
                          <View className="flex-row items-center">
                            <Tag size={16} className="text-slate-400 dark:text-slate-550 mr-2" />
                            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Creative Name</Text>
                          </View>
                          <Text className="text-slate-900 dark:text-white font-black text-sm">{selectedTxn.ad_title || 'General Ad'}</Text>
                        </View>

                        {selectedTxn.campaign_name && (
                          <View className="flex-row justify-between items-center mb-4 border-t border-slate-200/60 dark:border-slate-800 pt-4">
                            <View className="flex-row items-center">
                              <Megaphone size={16} className="text-slate-400 dark:text-slate-550 mr-2" />
                              <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Ad</Text>
                            </View>
                            <Text className="text-slate-900 dark:text-white font-black text-sm">{selectedTxn.campaign_name}</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View className="flex-row justify-between items-center mb-4 border-t border-slate-200/60 dark:border-slate-800 pt-4">
                        <View className="flex-row items-center">
                          <Info size={16} className="text-slate-400 dark:text-slate-550 mr-2" />
                          <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Details</Text>
                        </View>
                        <Text className="text-slate-900 dark:text-white font-black text-sm" numberOfLines={1}>{subtitle}</Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-center border-t border-slate-200/60 dark:border-slate-800 pt-4 mb-4">
                      <View className="flex-row items-center">
                        <Calendar size={16} className="text-slate-400 dark:text-slate-550 mr-2" />
                        <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Date & Time</Text>
                      </View>
                      <Text className="text-slate-900 dark:text-white font-bold text-sm text-right">
                        {new Date(selectedTxn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{'\n'}
                        <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          {new Date(selectedTxn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center border-t border-slate-200/60 dark:border-slate-800 pt-4">
                      <Text className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Status</Text>
                      <Text className="text-emerald-500 dark:text-emerald-400 font-black text-sm">Completed</Text>
                    </View>

                  </View>

                  {/* Secondary technical info */}
                  <Text className="text-slate-450 dark:text-slate-650 text-center text-[10px] font-semibold mt-6">
                    Ref ID: {selectedTxn.cashfree_order_id || `TXN-${selectedTxn.id}`}
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
