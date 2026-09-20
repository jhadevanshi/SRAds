import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, ScrollView, RefreshControl, ActivityIndicator, 
  TouchableOpacity, StyleSheet, Dimensions, Platform 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { businessService } from '../../services/business';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Wallet, PlayCircle, IndianRupee, Video, Image as ImageIcon, 
  MapPin, Clock, Settings, Plus, Building2, Navigation, Megaphone, 
  MonitorSmartphone, ChevronRight, ArrowRight, BarChart3, Sparkles, 
  Radio, ShieldCheck, Zap, Moon, Sun
} from 'lucide-react-native';
import { fonts } from '../../theme/designTokens';
import AppLogo from '../../components/AppLogo';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme?.isDark ?? theme?.isDarkMode ?? true;
  const toggleTheme = theme?.toggleTheme;
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState(null);
  const [liveFleet, setLiveFleet] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, fleetRes, campRes] = await Promise.all([
        businessService.getDashboard(),
        businessService.getLiveFleet().catch(() => ({ success: false, fleet: [] })),
        businessService.getCampaigns().catch(() => ({ success: false, campaigns: [] }))
      ]);

      if (dashRes.success) setStats(dashRes);
      if (fleetRes.success && fleetRes.fleet) setLiveFleet(fleetRes.fleet);
      if (campRes.success && campRes.campaigns) setCampaigns(campRes.campaigns.slice(0, 4));
    } catch (err) {
      console.error('Error fetching dashboard', err);
      setError('Unable to load some dashboard information.');
    }
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
    const liveInterval = setInterval(fetchData, 15000);
    return () => clearInterval(liveInterval);
  }, [fetchData]);

  useEffect(() => {
    const { DeviceEventEmitter } = require('react-native');
    const subPlayback = DeviceEventEmitter.addListener('AD_PLAYBACK_COMPLETED', () => {
      fetchData();
    });
    const subStatus = DeviceEventEmitter.addListener('DEVICE_STATUS_UPDATED', () => {
      fetchData();
    });
    const subCampaign = DeviceEventEmitter.addListener('CAMPAIGN_UPDATED', () => {
      fetchData();
    });

    return () => {
      subPlayback.remove();
      subStatus.remove();
      subCampaign.remove();
    };
  }, [fetchData]);

  const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading && !stats) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  const renderCampaignStatus = (campaign) => {
    if (campaign.approval_status === 'Pending' || (campaign.pending_ad_count && parseInt(campaign.pending_ad_count) > 0)) {
      return (
        <View style={[styles.statusPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
          <Text style={[styles.statusPillText, { color: '#F59E0B' }]}>Pending</Text>
        </View>
      );
    }
    if (campaign.approval_status === 'Rejected' || (campaign.rejected_ad_count && parseInt(campaign.rejected_ad_count) > 0)) {
      return (
        <View style={[styles.statusPill, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
          <Text style={[styles.statusPillText, { color: '#EF4444' }]}>Rejected</Text>
        </View>
      );
    }
    if (campaign.status?.toLowerCase() === 'active') {
      return (
        <View style={[styles.statusPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
          <View style={styles.greenPulse} />
          <Text style={[styles.statusPillText, { color: '#10B981' }]}>Active</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusPill, { backgroundColor: isDarkMode ? '#1E153D' : '#F1F5F9', borderColor: isDarkMode ? '#3B2A68' : '#E2E8F0' }]}>
        <Text style={[styles.statusPillText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>{campaign.status || 'Paused'}</Text>
      </View>
    );
  };

  const totalAds = stats?.stats?.total_ads || 0;
  const activeBalance = stats?.stats?.active_balance !== undefined ? stats.stats.active_balance : (stats?.wallet_balance || user?.wallet_balance || 0);
  const onHoldBalance = stats?.stats?.on_hold || 0;
  const totalBalance = stats?.stats?.total_balance !== undefined ? stats.stats.total_balance : (stats?.wallet_balance || user?.wallet_balance || 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF' }]}>
      
      {/* ── Top App Bar ────────────────────────────────────────────── */}
      <View style={[
        styles.headerBar, 
        { 
          backgroundColor: isDarkMode ? '#090614' : '#F8F7FF',
          borderBottomColor: isDarkMode ? '#1E153D' : '#EDE9FE' 
        }
      ]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarBox, isDarkMode ? styles.neonGlowSmall : null]}>
            <AppLogo size={42} isDark={isDarkMode} />
          </View>
          <View style={styles.headerTextBox}>
            <View style={styles.tagRow}>
              <Text style={[styles.welcomeTag, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>
                ADVERTISER PORTAL
              </Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={[styles.companyName, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
              {user?.company_name || 'My Business'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              { 
                backgroundColor: isDarkMode ? '#181033' : '#FFFFFF', 
                borderColor: isDarkMode ? '#281B4B' : '#E2E8F0' 
              }
            ]}
            activeOpacity={0.7}
          >
            {isDarkMode ? (
              <Sun size={19} color="#FBBF24" />
            ) : (
              <Moon size={19} color="#7C3AED" />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={[
              styles.settingsBtn,
              { backgroundColor: isDarkMode ? '#181033' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#E2E8F0' }
            ]}
            activeOpacity={0.7}
          >
            <Settings size={19} color={isDarkMode ? '#C084FC' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.flex1}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>

          {/* ── Hero Wallet Card with Violet/Purple Gradient ──────────── */}
          <View style={[styles.walletCardWrapper, isDarkMode ? styles.walletCardGlow : null]}>
            <LinearGradient
              colors={['#6D28D9', '#7C3AED', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.walletCard}
            >
              <View style={styles.walletTopRow}>
                <View style={styles.walletLabelBox}>
                  <Wallet size={16} color="#E9D5FF" />
                  <Text style={styles.walletLabelText}>Active Balance</Text>
                </View>
                {onHoldBalance > 0 && (
                  <View style={[styles.liveIndicatorPill, { backgroundColor: 'rgba(245, 158, 11, 0.25)', borderColor: 'rgba(245, 158, 11, 0.4)', borderWidth: 1 }]}>
                    <Clock size={11} color="#FDE68A" />
                    <Text style={[styles.liveIndicatorText, { color: '#FDE68A' }]}>
                      On Hold ₹{Number(onHoldBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.walletBalanceText} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(activeBalance)}
              </Text>

              <View style={styles.walletDivider} />

              <View style={styles.walletBottomRow}>
                <View style={styles.walletStatItem}>
                  <Text style={styles.walletStatLabel}>Today's Spend</Text>
                  <Text style={styles.walletStatValue} numberOfLines={1}>
                    {formatCurrency(stats?.stats?.total_spent || 0)}
                  </Text>
                </View>

                <View style={styles.walletStatItem}>
                  <Text style={styles.walletStatLabel}>Plays Today</Text>
                  <Text style={styles.walletStatValue} numberOfLines={1}>
                    {stats?.today_plays || 0} Plays
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('AddMoney')}
                  style={styles.addFundsBtn}
                  activeOpacity={0.85}
                >
                  <Plus size={14} color="#6D28D9" strokeWidth={3} />
                  <Text style={styles.addFundsBtnText}>Top Up</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* ── Quick Action Tiles (4 Symmetrical Buttons) ─────────────── */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateCampaign')}
              style={[
                styles.actionTile,
                { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.actionIconBox}>
                <Megaphone size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionTileTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                New Campaign
              </Text>
              <Text style={[styles.actionTileDesc, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                Target area & routes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('UploadAd')}
              style={[
                styles.actionTile,
                { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.actionIconBox}>
                <Video size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionTileTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                Upload Media
              </Text>
              <Text style={[styles.actionTileDesc, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                Videos & creatives
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('LiveFleet')}
              style={[
                styles.actionTile,
                { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#06B6D4', '#0E7490']} style={styles.actionIconBox}>
                <Navigation size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionTileTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                Fleet Tracker
              </Text>
              <Text style={[styles.actionTileDesc, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                Live transit screens
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Analytics')}
              style={[
                styles.actionTile,
                { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#10B981', '#047857']} style={styles.actionIconBox}>
                <BarChart3 size={18} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.actionTileTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                Analytics
              </Text>
              <Text style={[styles.actionTileDesc, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                Impressions & ROI
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Active Campaigns Section ──────────────────────────────── */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Sparkles size={16} color={isDarkMode ? '#C084FC' : '#7C3AED'} />
              <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                Active Campaigns
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('My Ads')} activeOpacity={0.7} style={styles.viewAllRow}>
              <Text style={[styles.viewAllText, { color: isDarkMode ? '#C084FC' : '#7C3AED' }]}>View All</Text>
              <ArrowRight size={13} color={isDarkMode ? '#C084FC' : '#7C3AED'} />
            </TouchableOpacity>
          </View>

          {campaigns.length === 0 ? (
            <View style={[
              styles.emptyCard, 
              { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
            ]}>
              <View style={[styles.emptyIconBox, { backgroundColor: isDarkMode ? '#201642' : '#F3F0FF' }]}>
                <Megaphone size={24} color="#A855F7" />
              </View>
              <Text style={[styles.emptyTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                No Active Campaigns
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                Put your brand in front of daily commuters across transit screens.
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('CreateCampaign')}
                activeOpacity={0.88}
                style={styles.emptyCta}
              >
                <LinearGradient
                  colors={['#7C3AED', '#9333EA']}
                  style={styles.emptyCtaGradient}
                >
                  <Plus size={15} color="#FFFFFF" strokeWidth={3} />
                  <Text style={styles.emptyCtaText}>Create Campaign</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
              {campaigns.map((camp, idx) => (
                <TouchableOpacity 
                  key={camp.id || idx}
                  onPress={() => navigation.navigate('My Ads')}
                  style={[
                    styles.campaignCard,
                    { 
                      backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', 
                      borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' 
                    }
                  ]}
                  activeOpacity={0.85}
                >
                  <View style={styles.campaignCardTop}>
                    <View style={styles.campTitleContainer}>
                      <Text style={[styles.campaignCardTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                        {camp.campaign_name}
                      </Text>
                      <View style={styles.campLocationRow}>
                        <MapPin size={11} color={isDarkMode ? '#A78BFA' : '#6B7280'} />
                        <Text style={[styles.campLocationText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                          {camp.area || 'All City Routes'}
                        </Text>
                      </View>
                    </View>
                    {renderCampaignStatus(camp)}
                  </View>

                  <View style={[styles.campaignCardStats, { backgroundColor: isDarkMode ? '#090614' : '#F8F7FF', borderColor: isDarkMode ? '#1E153D' : '#EDE9FE' }]}>
                    <View style={styles.campStatBox}>
                      <Text style={styles.campStatSub}>TOTAL SPEND</Text>
                      <Text style={[styles.campStatVal, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                        {formatCurrency(camp.total_spend || 0)}
                      </Text>
                    </View>
                    <View style={[styles.campStatDivider, { backgroundColor: isDarkMode ? '#281B4B' : '#E2E8F0' }]} />
                    <View style={styles.campStatBox}>
                      <Text style={styles.campStatSub}>TOTAL PLAYS</Text>
                      <Text style={[styles.campStatVal, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                        {camp.total_plays || 0}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── Live Transit Display Network Section ─────────────────── */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Radio size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
              <Text style={[styles.sectionHeading, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]}>
                Live Transit Display Network
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('LiveFleet')} activeOpacity={0.7} style={styles.viewAllRow}>
              <Text style={[styles.viewAllText, { color: isDarkMode ? '#38BDF8' : '#0284C7' }]}>Live Map</Text>
              <ArrowRight size={13} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('LiveFleet')}
            activeOpacity={0.9}
            style={[
              styles.fleetNetworkCard,
              { backgroundColor: isDarkMode ? '#140F24' : '#FFFFFF', borderColor: isDarkMode ? '#281B4B' : '#EDE9FE' }
            ]}
          >
            <View style={styles.fleetCardHeader}>
              <View style={styles.fleetCardHeaderLeft}>
                <View style={[styles.fleetIconContainer, { backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.15)' : '#E0F2FE' }]}>
                  <MonitorSmartphone size={22} color="#06B6D4" />
                </View>
                <View style={styles.fleetHeaderTextContainer}>
                  <Text style={[styles.fleetHeaderTitle, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                    {liveFleet.length} Screens Active in Fleet
                  </Text>
                  <Text style={[styles.fleetHeaderSub, { color: isDarkMode ? '#94A3B8' : '#64748B' }]} numberOfLines={1}>
                    Auto-rickshaws & transit displays
                  </Text>
                </View>
              </View>

              <View style={[styles.fleetActionBtn, { backgroundColor: isDarkMode ? '#1E153D' : '#F3F0FF' }]}>
                <Navigation size={13} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                <Text style={[styles.fleetActionBtnText, { color: isDarkMode ? '#38BDF8' : '#0284C7' }]}>Track</Text>
              </View>
            </View>

            {liveFleet.length > 0 ? (
              <View style={styles.fleetListPreview}>
                {liveFleet.slice(0, 3).map((vehicle, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.fleetItemRow, 
                      { 
                        backgroundColor: isDarkMode ? '#090614' : '#F8F7FF',
                        borderColor: isDarkMode ? '#1E153D' : '#EDE9FE' 
                      }
                    ]}
                  >
                    <View style={styles.fleetItemLeft}>
                      <View style={styles.liveVehicleDot} />
                      <Text style={[styles.fleetVehicleNumber, { color: isDarkMode ? '#F8FAFC' : '#1E1B4B' }]} numberOfLines={1}>
                        {vehicle.vehicle_number || `ADSD-${vehicle.id}`}
                      </Text>
                    </View>
                    <View style={styles.fleetItemRight}>
                      <MapPin size={12} color={isDarkMode ? '#A78BFA' : '#6B7280'} />
                      <Text style={[styles.fleetVehicleArea, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]} numberOfLines={1}>
                        {vehicle.area || 'Active Zone'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noFleetBox}>
                <Text style={[styles.noFleetText, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                  All transit devices are registered and synced with GPS triggers. Tap to view fleet map.
                </Text>
              </View>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  // Top Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginRight: 12,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonGlowSmall: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  welcomeTag: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  companyName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Wallet Card
  walletCardWrapper: {
    marginBottom: 16,
  },
  walletCardGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  walletCard: {
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletLabelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  walletLabelText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#E9D5FF',
    letterSpacing: 0.2,
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicatorText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#34D399',
  },
  walletBalanceText: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  walletDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginVertical: 12,
  },
  walletBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  walletStatItem: {
    flex: 1,
  },
  walletStatLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: '#DDD6FE',
    marginBottom: 2,
  },
  walletStatValue: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  addFundsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 13,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addFundsBtnText: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: '#6D28D9',
  },

  // Quick Actions Grid (4 Symmetrical Tiles)
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 16,
  },
  actionTile: {
    width: '48.5%',
    minHeight: 102,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1.2,
    justifyContent: 'center',
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTileTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  actionTileDesc: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },

  // Empty State
  emptyCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.2,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  emptyCta: {
    borderRadius: 13,
    overflow: 'hidden',
  },
  emptyCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 6,
  },
  emptyCtaText: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    fontSize: 13,
  },

  // Horizontal Scroll Campaigns
  horizontalScroll: {
    marginHorizontal: -18,
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 18,
    gap: 12,
  },
  campaignCard: {
    width: 250,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.2,
  },
  campaignCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  campTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  campaignCardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    marginBottom: 3,
  },
  campLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  campLocationText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  greenPulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  campaignCardStats: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1,
  },
  campStatBox: {
    flex: 1,
  },
  campStatSub: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#8B5CF6',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  campStatVal: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  campStatDivider: {
    width: 1,
    marginHorizontal: 8,
  },

  // Fleet Network Card
  fleetNetworkCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    marginBottom: 12,
  },
  fleetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fleetCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  fleetIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fleetHeaderTextContainer: {
    flex: 1,
  },
  fleetHeaderTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
  },
  fleetHeaderSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  fleetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  fleetActionBtnText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  fleetListPreview: {
    gap: 7,
  },
  fleetItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
  },
  fleetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  liveVehicleDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#06B6D4',
  },
  fleetVehicleNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
  fleetItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fleetVehicleArea: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    maxWidth: 130,
  },
  noFleetBox: {
    paddingVertical: 4,
  },
  noFleetText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
