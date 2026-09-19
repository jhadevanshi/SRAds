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
  Megaphone, Calendar, Receipt, PlayCircle, ShieldCheck, Zap, Sparkles
} from 'lucide-react-native';

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
    totalSpent: 0,
    totalAdded: 0,
    transactions: []
  });

  const fetchWallet = useCallback(async () => {
    try {
      const res = await businessService.getWallet();
      if (res.success) {
        setWalletData({
          transactions: res.transactions || [],
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
                <View style={styles.ambientCircle} />

                <View style={styles.heroTopRow}>
                  <Text style={styles.heroLabel}>CURRENT WALLET BALANCE</Text>
                  <View style={styles.liveChip}>
                    <View style={styles.activeDot} />
                    <Text style={styles.liveChipText}>Ready to Run Ads</Text>
                  </View>
                </View>

                <Text style={styles.heroBalance}>
                  ₹{walletData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>

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

            {/* Low Balance Warning Banner */}
            {walletData.balance < 500 && (
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 6,
  },

  // Hero Card
  heroCardWrapper: {
    marginBottom: 20,
  },
  heroCardGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientCircle: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
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
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  addFundsCTA: {
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addFundsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 14,
    gap: 6,
  },
  addFundsCTAText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // Presets
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '800',
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
    paddingTop: 12,
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DDD6FE',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '800',
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
    marginBottom: 18,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  warningSub: {
    fontSize: 11,
    lineHeight: 16,
  },

  // Activity Header
  activityHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  sectionHeaderBox: {
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Transaction Rows
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 1,
  },
  txnSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  txnTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnAmountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  txnAmountText: {
    fontSize: 13,
    fontWeight: '800',
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
