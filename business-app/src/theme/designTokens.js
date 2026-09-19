export const colors = {
  // Brand Gradients
  primaryGradient: ['#7C3AED', '#9333EA', '#C084FC'],
  accentGradient: ['#8B5CF6', '#D946EF'],
  cardGradientDark: ['#181033', '#120C26'],
  cardGradientLight: ['#FFFFFF', '#F8F7FF'],
  walletGradient: ['#6D28D9', '#9333EA', '#C084FC'],
  glowPurple: 'rgba(168, 85, 247, 0.35)',

  // Dark Mode
  dark: {
    bg: '#090614',
    surface: '#120C26',
    card: '#181033',
    cardHover: '#201642',
    border: '#281B4B',
    borderLight: '#3B2A68',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    inputBg: '#120C26',
    inputBorder: '#281B4B',
  },

  // Light Mode
  light: {
    bg: '#F8F7FF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardHover: '#F3F0FF',
    border: '#EDE9FE',
    borderLight: '#DDD6FE',
    textPrimary: '#1E1B4B',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    inputBg: '#F8F7FF',
    inputBorder: '#E5E7EB',
  },

  // Accents & Statuses
  neonPurple: '#A855F7',
  neonViolet: '#8B5CF6',
  neonFuchsia: '#D946EF',
  neonCyan: '#06B6D4',
  neonEmerald: '#10B981',
  neonAmber: '#F59E0B',
  neonRose: '#F43F5E',

  // Common
  white: '#FFFFFF',
  black: '#000000',
};

import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  semiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  extraBold: Platform.select({ ios: 'System', android: 'sans-serif' }),
  displayMedium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  displaySemiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  displayBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  displayExtraBold: Platform.select({ ios: 'System', android: 'sans-serif' }),
  displayBlack: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

export const typography = {
  screenTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageHeaderTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeader: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  metadata: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  statusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }
};

