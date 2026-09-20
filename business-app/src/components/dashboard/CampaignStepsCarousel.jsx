import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, Image, TouchableOpacity, Dimensions, 
  FlatList, StyleSheet, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, MapPin, Clock, Rocket, ChevronRight, 
  Video, Layers, Zap, ArrowRight, ShieldCheck 
} from 'lucide-react-native';
import { fonts } from '../../theme/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 36; // Accounting for 18px padding on each side

const REAL_STEPS = [
  {
    id: '1',
    stepNumber: 'STEP 1 OF 4',
    title: 'Select or Upload Creative',
    shortDesc: 'Choose 15s–30s HD video commercials or crisp static posters ready for smart transit displays.',
    tagIcon: Video,
    tagColor: '#38BDF8',
    image: require('../../../assets/steps/step1_creative.jpg'),
    actionLabel: 'Add Media'
  },
  {
    id: '2',
    stepNumber: 'STEP 2 OF 4',
    title: 'Target Transit Corridors',
    shortDesc: 'Broadcast across high-traffic routes like SG Highway, Bopal, Shivranjini, or Citywide fleet.',
    tagIcon: MapPin,
    tagColor: '#C084FC',
    image: require('../../../assets/steps/step2_corridors.jpg'),
    actionLabel: 'Select Routes'
  },
  {
    id: '3',
    stepNumber: 'STEP 3 OF 4',
    title: 'Schedule & Peak Hours',
    shortDesc: 'Configure campaign start/end dates and daily peak transit hours for maximum passenger reach.',
    tagIcon: Clock,
    tagColor: '#FBBF24',
    image: require('../../../assets/steps/step3_schedule.jpg'),
    actionLabel: 'Set Time'
  },
  {
    id: '4',
    stepNumber: 'STEP 4 OF 4',
    title: 'Instant Budget & Launch',
    shortDesc: 'Transparent ₹0.35/sec billing, active balance verification, and instant broadcasting on the go.',
    tagIcon: Rocket,
    tagColor: '#34D399',
    image: require('../../../assets/steps/step4_launch.jpg'),
    actionLabel: 'Launch Ad'
  }
];

// Infinite Cloned Buffer for 100% seamless forward looping (Step 4 -> Step 1 without backwards reverse lag)
const INFINITE_DATA = [
  { ...REAL_STEPS[3], key: 'clone-start-step4' },
  { ...REAL_STEPS[0], key: 'real-step1' },
  { ...REAL_STEPS[1], key: 'real-step2' },
  { ...REAL_STEPS[2], key: 'real-step3' },
  { ...REAL_STEPS[3], key: 'real-step4' },
  { ...REAL_STEPS[0], key: 'clone-end-step1' },
];

export default function CampaignStepsCarousel({ navigation, isDarkMode }) {
  const [activeIndex, setActiveIndex] = useState(0); // 0, 1, 2, 3
  const flatListRef = useRef(null);
  const currentIndexRef = useRef(1);
  const isInteracting = useRef(false);

  // Auto-slide every 3.5 seconds (reduced by 1 second for brisk, responsive pacing)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isInteracting.current && flatListRef.current) {
        const nextVirtualIndex = currentIndexRef.current + 1;
        currentIndexRef.current = nextVirtualIndex;
        
        flatListRef.current.scrollToIndex({
          index: nextVirtualIndex,
          animated: true,
        });

        // Update active dot index
        if (nextVirtualIndex === 5) {
          setActiveIndex(0);
        } else {
          setActiveIndex(nextVirtualIndex - 1);
        }
      }
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const handleMomentumScrollEnd = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const virtualIndex = Math.round(offset / CARD_WIDTH);

    if (virtualIndex === 5) {
      // Reached cloned Step 1 at the end -> silently snap back to real Step 1 (index 1)
      currentIndexRef.current = 1;
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      setActiveIndex(0);
    } else if (virtualIndex === 0) {
      // Reached cloned Step 4 at the beginning -> silently snap to real Step 4 (index 4)
      currentIndexRef.current = 4;
      flatListRef.current?.scrollToIndex({ index: 4, animated: false });
      setActiveIndex(3);
    } else {
      currentIndexRef.current = virtualIndex;
      setActiveIndex(virtualIndex - 1);
    }

    // Release interaction lock after gesture
    setTimeout(() => {
      isInteracting.current = false;
    }, 1000);
  };

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const virtualIndex = Math.round(offset / CARD_WIDTH);
    
    let realIdx = 0;
    if (virtualIndex === 0) realIdx = 3;
    else if (virtualIndex === 5) realIdx = 0;
    else realIdx = Math.max(0, Math.min(3, virtualIndex - 1));

    if (realIdx !== activeIndex) {
      setActiveIndex(realIdx);
    }
  };

  const goToSlide = (targetStepIndex) => {
    const targetVirtualIndex = targetStepIndex + 1;
    currentIndexRef.current = targetVirtualIndex;
    setActiveIndex(targetStepIndex);
    flatListRef.current?.scrollToIndex({
      index: targetVirtualIndex,
      animated: true,
    });
  };

  const handleCardPress = () => {
    if (navigation) {
      navigation.navigate('CreateCampaign');
    }
  };

  const getItemLayout = (data, index) => ({
    length: CARD_WIDTH,
    offset: CARD_WIDTH * index,
    index,
  });

  const renderItem = ({ item }) => {
    const TagIcon = item.tagIcon;

    return (
      <TouchableOpacity 
        activeOpacity={0.92}
        onPress={handleCardPress}
        style={{ width: CARD_WIDTH }}
      >
        <LinearGradient
          colors={['#6D28D9', '#7C3AED', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Top Row: Step Tag + Quick CTA */}
          <View style={styles.cardTopRow}>
            <View style={styles.stepBadge}>
              <TagIcon size={12} color={item.tagColor} />
              <Text style={[styles.stepBadgeText, { color: item.tagColor }]}>
                {item.stepNumber}
              </Text>
            </View>

            <View style={styles.actionPill}>
              <Text style={styles.actionPillText}>Launch Guide</Text>
              <ArrowRight size={11} color="#E9D5FF" style={{ marginLeft: 3 }} />
            </View>
          </View>

          {/* Content Row: Text + 3D Realistic Visual */}
          <View style={styles.contentRow}>
            <View style={styles.textColumn}>
              <Text style={styles.slideTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.slideDesc} numberOfLines={3}>
                {item.shortDesc}
              </Text>
            </View>

            <View style={styles.imageFrameWrapper}>
              <Image 
                source={item.image} 
                style={styles.stepImage}
                resizeMode="cover"
              />
              <View style={styles.imageBorderOverlay} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.containerGlow : null]}>
      {/* Seamless Infinite Horizontal Carousel */}
      <FlatList
        ref={flatListRef}
        data={INFINITE_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={1}
        getItemLayout={getItemLayout}
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={() => { isInteracting.current = true; }}
        bounces={false}
      />

      {/* Pagination Indicator Dots Below Carousel */}
      <View style={styles.paginationContainer}>
        {REAL_STEPS.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
              style={[
                styles.dot,
                isActive ? styles.activeDot : (isDarkMode ? styles.inactiveDotDark : styles.inactiveDotLight)
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
  },
  containerGlow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 22,
    padding: 16,
    minHeight: 154,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  actionPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: '#E9D5FF',
    letterSpacing: 0.2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  slideTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 20,
    marginBottom: 4,
  },
  slideDesc: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#E9D5FF',
    lineHeight: 16,
    opacity: 0.92,
  },
  imageFrameWrapper: {
    width: 96,
    height: 84,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E153D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  imageBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    paddingBottom: 2,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#C084FC',
  },
  inactiveDotDark: {
    width: 6,
    backgroundColor: '#3B2A68',
  },
  inactiveDotLight: {
    width: 6,
    backgroundColor: '#DDD6FE',
  },
});
