import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, PanResponder, Dimensions, 
  StyleSheet, Platform, ScrollView 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, X, Play, Pause, Check, Scissors, RotateCcw, 
  Sparkles, Clock, CheckCircle2 
} from 'lucide-react-native';
import { fonts } from '../theme/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TIMELINE_HORIZONTAL_PADDING = 18;
const TRACK_WIDTH = SCREEN_WIDTH - (TIMELINE_HORIZONTAL_PADDING * 2);
const THUMB_WIDTH = 22;
const MIN_SELECTION_WIDTH = 32;
const MAX_TRACK_WIDTH = TRACK_WIDTH - (THUMB_WIDTH * 2);

const formatTimeCode = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
};

export default function VideoTrimmer({ uri, originalDurationSec = 30, onSave, onCancel }) {
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState(originalDurationSec > 0 ? originalDurationSec : 30);
  const [leftPos, setLeftPos] = useState(0);
  const [rightPos, setRightPos] = useState(MAX_TRACK_WIDTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // References for smooth dragging & timer loops
  const startLeftRef = useRef(0);
  const startRightRef = useRef(MAX_TRACK_WIDTH);
  const leftPosRef = useRef(0);
  const rightPosRef = useRef(MAX_TRACK_WIDTH);
  const durationRef = useRef(duration);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    leftPosRef.current = leftPos;
  }, [leftPos]);

  useEffect(() => {
    rightPosRef.current = rightPos;
  }, [rightPos]);

  // Video Player instance via expo-video
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Listen to video player updates
  useEffect(() => {
    if (!player) return;

    const timeUpdateSub = player.addListener('timeUpdate', (event) => {
      const current = event.currentTime || 0;
      setCurrentTime(current);

      const currentStartSec = (leftPosRef.current / MAX_TRACK_WIDTH) * durationRef.current;
      const currentEndSec = (rightPosRef.current / MAX_TRACK_WIDTH) * durationRef.current;

      // Loop back to start when playback reaches trimmed end
      if (isPlayingRef.current && current >= currentEndSec) {
        player.pause();
        player.currentTime = currentStartSec;
        player.play();
      }
    });

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay') {
        if (player.duration && player.duration > 0 && (!originalDurationSec || originalDurationSec <= 0)) {
          setDuration(player.duration);
        }
      }
    });

    return () => {
      timeUpdateSub?.remove();
      statusSub?.remove();
    };
  }, [player, originalDurationSec]);

  // Pan Responder for Left Trim Handle
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startLeftRef.current = leftPosRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const rawNewPos = startLeftRef.current + gestureState.dx;
        const boundedPos = Math.max(0, Math.min(rightPosRef.current - MIN_SELECTION_WIDTH, rawNewPos));
        setLeftPos(boundedPos);
        seekToRatio(boundedPos / MAX_TRACK_WIDTH);
      },
      onPanResponderRelease: () => {
        const startSec = (leftPosRef.current / MAX_TRACK_WIDTH) * durationRef.current;
        if (player) player.currentTime = startSec;
      }
    })
  ).current;

  // Pan Responder for Right Trim Handle
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRightRef.current = rightPosRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        const rawNewPos = startRightRef.current + gestureState.dx;
        const boundedPos = Math.max(leftPosRef.current + MIN_SELECTION_WIDTH, Math.min(MAX_TRACK_WIDTH, rawNewPos));
        setRightPos(boundedPos);
        seekToRatio(boundedPos / MAX_TRACK_WIDTH);
      },
      onPanResponderRelease: () => {
        const startSec = (leftPosRef.current / MAX_TRACK_WIDTH) * durationRef.current;
        if (player) player.currentTime = startSec;
      }
    })
  ).current;

  const seekToRatio = (ratio) => {
    if (player && durationRef.current > 0) {
      player.currentTime = Math.max(0, Math.min(durationRef.current, ratio * durationRef.current));
    }
  };

  const startSec = (leftPos / MAX_TRACK_WIDTH) * duration;
  const endSec = (rightPos / MAX_TRACK_WIDTH) * duration;
  const selectedDuration = Math.max(0.1, endSec - startSec);

  const togglePreview = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      player.currentTime = startSec;
      player.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  };

  const applyPreset = (presetSeconds) => {
    if (!duration || duration <= 0) return;
    if (presetSeconds === 'full') {
      setLeftPos(0);
      setRightPos(MAX_TRACK_WIDTH);
      seekToRatio(0);
      return;
    }

    const targetSec = Math.min(presetSeconds, duration);
    const newRightRatio = targetSec / duration;
    setLeftPos(0);
    setRightPos(newRightRatio * MAX_TRACK_WIDTH);
    seekToRatio(0);
  };

  const handleSave = () => {
    if (player) {
      player.pause();
    }
    onSave({
      start: parseFloat(startSec.toFixed(1)),
      end: parseFloat(endSec.toFixed(1)),
      duration: parseFloat(selectedDuration.toFixed(1))
    });
  };

  const progressRatio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const playheadPos = progressRatio * MAX_TRACK_WIDTH + THUMB_WIDTH;

  // Adaptive video height to ensure all controls fit nicely on small or large devices
  const videoHeight = Math.min(260, Math.max(200, SCREEN_HEIGHT * 0.28));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerIconBtn} activeOpacity={0.7}>
          <ArrowLeft size={19} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Video Trimmer</Text>
          <Text style={styles.headerSubtitle}>Set Transit Ad Playback Range</Text>
        </View>

        <TouchableOpacity onPress={() => applyPreset('full')} style={styles.headerResetBtn} activeOpacity={0.7}>
          <RotateCcw size={15} color="#C084FC" />
          <Text style={styles.headerResetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Video Player Preview ───────────────────────────────────── */}
        <View style={[styles.previewContainer, { height: videoHeight }]}>
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />

          {/* Center Play/Pause Touch Overlay */}
          <TouchableOpacity 
            style={styles.playOverlay} 
            onPress={togglePreview}
            activeOpacity={0.85}
          >
            <View style={[styles.playBtnCircle, isPlaying ? styles.playBtnCirclePlaying : null]}>
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </View>
          </TouchableOpacity>

          {/* Live Timestamp Pill Overlay */}
          <View style={styles.currentPositionBadge}>
            <View style={[styles.liveDot, { backgroundColor: isPlaying ? '#10B981' : '#A855F7' }]} />
            <Text style={styles.currentPositionText}>
              {formatTimeCode(currentTime)} / {formatTimeCode(duration)}
            </Text>
          </View>
        </View>

        {/* ── Trimmer Control Card ──────────────────────────────────── */}
        <View style={styles.editorCard}>
          
          {/* Metric Overview Row */}
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>START TIME</Text>
              <Text style={styles.metricValue}>{formatTimeCode(startSec)}</Text>
            </View>

            <View style={styles.selectedDurationPill}>
              <Scissors size={13} color="#C084FC" />
              <Text style={styles.selectedDurationText}>
                {selectedDuration.toFixed(1)}s Flight
              </Text>
            </View>

            <View style={[styles.metricItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.metricLabel}>END TIME</Text>
              <Text style={styles.metricValue}>{formatTimeCode(endSec)}</Text>
            </View>
          </View>

          {/* Timeline Track with Visual Drag Handles */}
          <View style={styles.timelineWrapper}>
            {/* Base Inactive Track */}
            <View style={styles.trackBackground} />

            {/* Active Highlighted Region */}
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.trackActive,
                {
                  left: leftPos + THUMB_WIDTH,
                  width: Math.max(0, rightPos - leftPos),
                }
              ]}
            />

            {/* Playhead Line */}
            {playheadPos >= leftPos + THUMB_WIDTH && playheadPos <= rightPos + THUMB_WIDTH && (
              <View style={[styles.playheadLine, { left: playheadPos }]} />
            )}

            {/* Left Handle */}
            <View 
              style={[styles.handle, { left: leftPos }]} 
              {...leftPanResponder.panHandlers}
            >
              <View style={styles.handleGrip} />
            </View>

            {/* Right Handle */}
            <View 
              style={[styles.handle, { left: rightPos + THUMB_WIDTH }]} 
              {...rightPanResponder.panHandlers}
            >
              <View style={styles.handleGrip} />
            </View>
          </View>

          {/* Quick Trim Preset Chips */}
          <View style={styles.presetSection}>
            <Text style={styles.presetHeading}>QUICK PRESETS</Text>
            <View style={styles.presetChipsRow}>
              <TouchableOpacity 
                style={styles.presetChip} 
                onPress={() => applyPreset(15)}
                activeOpacity={0.75}
              >
                <Text style={styles.presetChipText}>15s Short</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.presetChip} 
                onPress={() => applyPreset(30)}
                activeOpacity={0.75}
              >
                <Text style={styles.presetChipText}>30s Standard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.presetChip} 
                onPress={() => applyPreset('full')}
                activeOpacity={0.75}
              >
                <Text style={styles.presetChipText}>Full Video</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── Bottom Action Footer (Elevated above system navigation) ── */}
      <View style={[
        styles.footer, 
        { paddingBottom: Math.max(insets.bottom, 14) + 6 }
      ]}>
        <TouchableOpacity 
          style={styles.previewBtn} 
          onPress={togglePreview}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={17} color="#C084FC" />
          ) : (
            <Play size={17} color="#C084FC" style={{ marginLeft: 2 }} />
          )}
          <Text style={styles.previewBtnText}>
            {isPlaying ? 'Pause Preview' : 'Preview Trim'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Check size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.saveBtnText}>Apply & Use Video</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090614',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E153D',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#181033',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#281B4B',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  headerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#181033',
    borderWidth: 1,
    borderColor: '#281B4B',
  },
  headerResetText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#C084FC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  previewContainer: {
    marginHorizontal: 16,
    backgroundColor: '#000000',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#1E153D',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(124, 58, 237, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playBtnCirclePlaying: {
    backgroundColor: 'rgba(18, 12, 38, 0.65)',
  },
  currentPositionBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(9, 6, 20, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  currentPositionText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  editorCard: {
    backgroundColor: '#120C26',
    borderWidth: 1.2,
    borderColor: '#281B4B',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricItem: {
    minWidth: 70,
  },
  metricLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#A78BFA',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
    color: '#F8FAFC',
  },
  selectedDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectedDurationText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#C084FC',
  },
  timelineWrapper: {
    height: 44,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 14,
  },
  trackBackground: {
    height: 30,
    backgroundColor: '#1E153D',
    borderRadius: 8,
    marginHorizontal: THUMB_WIDTH,
    borderWidth: 1,
    borderColor: '#3B2A68',
  },
  trackActive: {
    position: 'absolute',
    height: 30,
    borderRadius: 7,
    opacity: 0.88,
  },
  playheadLine: {
    position: 'absolute',
    width: 2,
    height: 36,
    backgroundColor: '#FFFFFF',
    zIndex: 5,
    borderRadius: 1,
  },
  handle: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#A855F7',
  },
  handleGrip: {
    width: 3,
    height: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 1.5,
  },
  presetSection: {
    marginTop: 2,
  },
  presetHeading: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 7,
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    backgroundColor: '#181033',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#281B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#E2E8F0',
  },
  footer: {
    backgroundColor: '#090614',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E153D',
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#181033',
    borderWidth: 1.2,
    borderColor: '#3B2A68',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#C084FC',
  },
  saveBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 13,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    fontFamily: fonts.extraBold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
