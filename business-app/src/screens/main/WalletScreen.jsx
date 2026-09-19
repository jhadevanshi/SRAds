import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, SectionList, TouchableOpacity, RefreshControl, 
  ActivityIndicator, Modal, StyleSheet, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Wallet, Info, Plus, X, ArrowUpRight, ArrowDownRight, Tag, 
  Megaphone, Calendar, Receipt, PlayCircle, ShieldCheck, Zap, Sparkles, Lock
} from 'lucide-react-native';
import { fonts } from '../../theme/designTokens';

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
      label = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase();
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(txn);
  });

  return Object.keys(groups).map(key => ({
    title: key,
    data: groups[key]
  }));
};

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quickAmount, setQuickAmount] = useState('1000');
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalBalance: 0,
    onHold: 0,
    activeBalance: 0,
    totalSpent: 0,
    totalAdded: 0,
    transactions: []
  });

  const fetchWallet = useCallback(async () => {
    try {
      const res = await businessService.getWallet();
      if (res.success) {
        const total = parseFloat(res.total_balance !== undefined ? res.total_balance : (res.wallet_balance || 0));
        const onHold = parseFloat(res.on_hold || 0);
        const active = parseFloat(res.active_balance !== undefined ? res.active_balance : Math.max(0, total - onHold));
        setWalletData({
          transactions: res.transactions || [],
          totalSpent: parseFloat(res.total_spent || 0),
          totalAdded: parseFloat(res.total_added || 0),
          balance: total,
          totalBalance: total,
          onHold: onHold,
          activeBalance: active
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
          title: 'Administrative Top-Up', 
          subtitle: 'Added by Network Operator',
          icon: ShieldCheck,
          color: '#10B981'
        };
      }
      const refText = item.cashfree_order_id ? `Ref: #${item.cashfree_order_id.slice(-8)}` : 'Instant Recharge';
      return { 
        title: 'Wallet Recharge', 
        subtitle: `via UPI / Instant • ${refText}`,
        icon: ArrowDownRight,
        color: '#10B981'
      };
    } else {
      if (item.isGrouped) {
        return { 
          title: 'Transit Ad Playback', 
          subtitle: `${item.ad_title} • ${item.count} play${item.count > 1 ? 's' : ''}`,
          icon: PlayCircle,
          color: '#A855F7'
        };
      }
      if (item.reason && item.reason.includes('Playback deduction')) {
        const adName = item.ad_title || 'Ad Creative';
        const campName = item.campaign_name ? `Ad: ${item.campaign_name}` : 'Transit Playback';
        return { 
          title: 'Screen Playback Debit', 
          subtitle: `${adName} • ${campName}`,
          icon: PlayCircle,
          color: '#A855F7'
        };
      }
      return { 
        title: 'Advertising Spend', 
        subtitle: item.reason || 'Campaign run',
        icon: ArrowUpRight,
        color: '#94A3B8'
      };
    }
  };

  const renderItem = ({ item }) => {
    const isCredit = item.type === 'Credit';
    const date = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const time = new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const { title, subtitle, icon: TxnIcon, color: iconColor } = formatTxnText(item);

    return (
      <TouchableOpacity 
        onPress={() => setSelectedTxn(item)}
        activeOpacity={0.7}
        style={[
          styles.txnRow,
          { borderBottomColor: isDarkMode ? '#1E153D' : '#EDE9FE' }
        ]}
      >
        <View style={styles.txnLeft}>
          <View style={[
            styles.txnIconBox,
            { backgroundColor: isCredit ? 'rgba(16, 185, 129, 0.12)' : (isDarkMode ? '#1E153D' : '#F3F0FF') }
          ]}>
            <TxnIcon size={18} color={iconColor} />
          </View>
          
          <View style={styles.txnTextContainer}>
            <Text style={[styles.txnTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
              {title}
            </Text>
            <Text style={[styles.txnSubtitle, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
              {subtitle}
            </Text>
            <Text style={[styles.txnTime, { color: isDarkMode ? '#64538A' : '#9CA3AF' }]}>
              {date} · {time}
            </Text>
          </View>
        </View>

        <View style={styles.txnRight}>
          <View style={[
            styles.txnAmountPill,
            { backgroundColor: isCredit ? 'rgba(16, 185, 129, 0.12)' : (isDarkMode ? 'rgba(168, 85, 247, 0.1)' : '#F3F0FF') }
          ]}>
            <Text style={[
              styles.txnAmountText,
              { color: isCredit ? '#10B981' : (isDarkMode ? '#C084FC' : '#7C3AED') }
            ]}>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF' }]} edges={['top']}>
      
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={[
        styles.topHeader,
        { 
          backgroundColor: isDarkMode ? '#090614' : '#F8F7FF',
          borderBottomColor: isDarkMode ? '#1E153D' : '#EDE9FE'
        }
      ]}>
        <Text style={[styles.screenTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
          Wallet & Billing
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeaderBox, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF' }]}>
            <Text style={[styles.sectionHeaderText, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>
              {title}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            
            {/* ── Main Violet Gradient Card ──────────────────────────── */}
            <View style={[styles.heroCardWrapper, isDarkMode ? styles.heroCardGlow : null]}>
              <LinearGradient
                colors={['#6D28D9', '#7C3AED', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroTopRow}>
                  <Text style={styles.heroLabel}>AVAILABLE ACTIVE BALANCE</Text>
                  <View style={styles.liveChip}>
                    <View style={styles.activeDot} />
                    <Text style={styles.liveChipText}>Ready to Run Ads</Text>
                  </View>
                </View>

                <Text style={styles.heroBalance}>
                  ₹{walletData.activeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>

                {/* 3-Column Balance Breakdown Inside Card */}
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>ACTIVE</Text>
                    <Text style={styles.breakdownVal}>
                      ₹{walletData.activeBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View style={styles.breakdownDivider} />
                  <View style={styles.breakdownItem}>
                    <Text style={[styles.breakdownLabel, walletData.onHold > 0 ? { color: '#FDE68A' } : null]}>
                      ON HOLD {walletData.onHold > 0 ? '🔒' : ''}
                    </Text>
                    <Text style={[styles.breakdownVal, walletData.onHold > 0 ? { color: '#FDE68A' } : null]}>
                      ₹{walletData.onHold.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View style={styles.breakdownDivider} />
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>TOTAL</Text>
                    <Text style={styles.breakdownVal}>
                      ₹{walletData.totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                </View>

                {/* Quick Add Funds CTA */}
                <TouchableOpacity 
                  onPress={handleAddMoney}
                  activeOpacity={0.88}
                  style={styles.addFundsCTA}
                >
                  <LinearGradient
                    colors={['#A855F7', '#C084FC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addFundsGradient}
                  >
                    <Plus size={18} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.addFundsCTAText}>Add Campaign Funds</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Quick Top-Up Preset Chips */}
                <View style={styles.presetChipsRow}>
                  {['500', '1000', '2000'].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setQuickAmount(amt)}
                      style={[
                        styles.presetChip,
                        quickAmount === amt ? styles.presetChipActive : styles.presetChipInactive
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.presetChipText,
                        quickAmount === amt ? styles.presetChipTextActive : styles.presetChipTextInactive
                      ]}>
                        +₹{parseInt(amt).toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setQuickAmount('')}
                    style={[
                      styles.presetChip,
                      quickAmount === '' ? styles.presetChipActive : styles.presetChipInactive
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.presetChipText,
                      quickAmount === '' ? styles.presetChipTextActive : styles.presetChipTextInactive
                    ]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Totals Row */}
                <View style={styles.totalsRow}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalLabel}>LIFETIME ADDED</Text>
                    <Text style={styles.totalVal}>
                      ₹{walletData.totalAdded.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View style={styles.totalsDivider} />
                  <View style={styles.totalItem}>
                    <Text style={styles.totalLabel}>SPENT ON SCREENS</Text>
                    <Text style={styles.totalVal}>
                      ₹{walletData.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* On Hold Informational Banner if campaigns pending */}
            {walletData.onHold > 0 && (
              <View style={[
                styles.warningBanner,
                { backgroundColor: isDarkMode ? '#1E1530' : '#FFFBEB', borderColor: isDarkMode ? '#4C2D66' : '#FDE68A' }
              ]}>
                <Lock size={16} color="#F59E0B" style={{ marginTop: 2 }} />
                <View style={styles.flex1}>
                  <Text style={[styles.warningTitle, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                    ₹{walletData.onHold.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Temporarily On Hold
                  </Text>
                  <Text style={[styles.warningSub, { color: isDarkMode ? '#CBD5E1' : '#B45309' }]}>
                    Funds are reserved for campaigns awaiting admin compliance approval and cannot be used for other campaigns.
                  </Text>
                </View>
              </View>
            )}

            {/* Low Balance Warning Banner */}
            {walletData.activeBalance < 500 && (
              <View style={[
                styles.warningBanner,
                { backgroundColor: isDarkMode ? '#1E153D' : '#FEF3C7', borderColor: isDarkMode ? '#4C3B78' : '#FDE68A' }
              ]}>
                <Info size={16} color="#F59E0B" style={{ marginTop: 2 }} />
                <View style={styles.flex1}>
                  <Text style={[styles.warningTitle, { color: isDarkMode ? '#FDE68A' : '#92400E' }]}>
                    Advertising Balance Running Low
                  </Text>
                  <Text style={[styles.warningSub, { color: isDarkMode ? '#CBD5E1' : '#B45309' }]}>
                    Add funds to ensure your transit campaigns continue broadcasting smoothly.
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.activityHeading, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
              Transaction Ledger
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyLoadingBox}><ActivityIndicator color="#A855F7" /></View>
          ) : (
            <View style={[
              styles.emptyStateBox,
              { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
            ]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#1E153D' : '#F3F0FF' }]}>
                <Wallet size={28} color="#A855F7" />
              </View>
              <Text style={[styles.emptyLedgerTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                No Wallet Activity Yet
              </Text>
              <Text style={[styles.emptyLedgerSub, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                Top up your wallet to start displaying advertisements across the transit screen network.
              </Text>
            </View>
          )
        }
      />

      {/* ── Transaction Detail Modal ──────────────────────────────── */}
      <Modal visible={!!selectedTxn} transparent animationType="fade" onRequestClose={() => setSelectedTxn(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[
            styles.modalSheet,
            { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
          ]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                Transaction Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedTxn(null)} style={styles.modalCloseBtn}>
                <X size={18} color={isDarkMode ? '#CBD5E1' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {selectedTxn && (() => {
              const isCredit = selectedTxn.type === 'Credit';
              const { title, subtitle } = formatTxnText(selectedTxn);
              return (
                <View>
                  <View style={styles.modalAmountBox}>
                    <Text style={styles.modalAmountLabel}>TRANSACTION AMOUNT</Text>
                    <Text style={[
                      styles.modalAmountVal,
                      { color: isCredit ? '#10B981' : (isDarkMode ? '#F8FAFC' : '#1E1B4B') }
                    ]}>
                      {isCredit ? '+' : '−'}₹{parseFloat(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={[
                    styles.modalDetailsCard,
                    { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF', borderColor: isDarkMode ? '#1E153D' : '#EDE9FE' }
                  ]}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailKey, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Type</Text>
                      <Text style={[styles.detailVal, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>{title}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailKey, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Reference</Text>
                      <Text style={[styles.detailVal, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>{subtitle}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailKey, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Date & Time</Text>
                      <Text style={[styles.detailVal, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                        {new Date(selectedTxn.created_at).toLocaleString('en-IN')}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={[styles.detailKey, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Status</Text>
                      <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 13 }}>Completed</Text>
                    </View>
                  </View>

                  <Text style={[styles.modalRefText, { color: isDarkMode ? '#64538A' : '#9CA3AF' }]}>
                    ID: {selectedTxn.cashfree_order_id || `TXN-${selectedTxn.id}`}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  headerSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },

  // Hero Card
  heroCardWrapper: {
    marginBottom: 16,
  },
  heroCardGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#E9D5FF',
    letterSpacing: 0.8,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveChipText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#34D399',
  },
  heroBalance: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#E9D5FF',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  breakdownVal: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  breakdownDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  addFundsCTA: {
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addFundsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    gap: 6,
  },
  addFundsCTAText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: -0.2,
  },

  // Presets
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  presetChipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  presetChipText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  presetChipTextActive: {
    color: '#6D28D9',
  },
  presetChipTextInactive: {
    color: '#FFFFFF',
  },

  // Totals Row
  totalsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    paddingTop: 10,
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#DDD6FE',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  totalVal: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  totalsDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  warningTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    marginBottom: 2,
  },
  warningSub: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },

  // Activity Header
  activityHeading: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  sectionHeaderBox: {
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },

  // Transaction Rows
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  txnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnTextContainer: {
    flex: 1,
  },
  txnTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginBottom: 1,
  },
  txnSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginBottom: 2,
  },
  txnTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmountPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
  },
  txnAmountText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },

  // Empty State
  emptyLoadingBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyStateBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 22,
    borderWidth: 1.2,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyLedgerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyLedgerSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.2,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalAmountBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  modalAmountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  modalAmountVal: {
    fontSize: 30,
    fontWeight: '900',
  },
  modalDetailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  modalRefText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
});
