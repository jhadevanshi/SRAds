import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Scissors, 
  X, 
  Film, 
  Image as ImageIcon,
  Clock 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ── Fullscreen Video Component with Precise Control Alignment ───────────────
const FullscreenVideoPlayer = memo(({ uri, title, duration, trimStart, trimEnd, canTrim, onTrimPress, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false; // Commercial audio enabled by default
    p.play();
  });

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!player) return;
    player.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'space-between' }}>
      
      {/* ── TOP BAR: Trim (Left) | Audio (Centre) | Back/Close (Right) ──────── */}
      <SafeAreaView edges={['top']} style={{ zIndex: 30 }}>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 }}>
          
          {/* TOP LEFT: Trim Option */}
          <View style={{ minWidth: 80, alignItems: 'flex-start' }}>
            {canTrim ? (
              <TouchableOpacity 
                onPress={onTrimPress}
                activeOpacity={0.8}
                style={{
                  backgroundColor: '#9333EA',
                  borderColor: 'rgba(216, 180, 254, 0.5)',
                  borderWidth: 1.5,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#A855F7',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Scissors size={15} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '900', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Trim
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Commercial
                </Text>
              </View>
            )}
          </View>

          {/* TOP CENTRE: Audio Option (Mute / Unmute toggle) */}
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={toggleMute}
              activeOpacity={0.75}
              style={{
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                borderColor: isMuted ? '#EF4444' : '#10B981',
                borderWidth: 1.5,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 22,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: isMuted ? '#EF4444' : '#10B981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              {isMuted ? (
                <>
                  <VolumeX size={17} color="#F87171" />
                  <Text style={{ color: '#FCA5A5', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
                    Muted
                  </Text>
                </>
              ) : (
                <>
                  <Volume2 size={17} color="#34D399" />
                  <Text style={{ color: '#6EE7B7', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
                    Audio On
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* TOP RIGHT: Back / Close Option */}
          <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
            <TouchableOpacity 
              onPress={onClose}
              activeOpacity={0.75}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <X size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>

      {/* ── CENTER VIDEO CANVAS: Tap to toggle playback ─────────────────────── */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={togglePlay}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        <VideoView 
          player={player} 
          style={{ width: '100%', height: '100%' }} 
          contentFit="contain" 
          nativeControls={false} 
        />
        
        {/* Subtle Center Overlay Icon if paused */}
        {!isPlaying && (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.35)' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(124, 58, 237, 0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#A855F7', shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 }}>
              <Play size={34} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* ── BOTTOM AREA: Info & Bottom Centre Play/Pause Button ──────────────── */}
      <SafeAreaView edges={['bottom']} style={{ zIndex: 30 }}>
        <View style={{ backgroundColor: 'rgba(10, 8, 20, 0.94)', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, alignItems: 'center' }}>
          
          {/* Top Badges in Bottom Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.18)', borderColor: 'rgba(56, 189, 248, 0.45)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Film size={11} color="#38BDF8" style={{ marginRight: 4 }} />
              <Text style={{ color: '#38BDF8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Transit Video
              </Text>
            </View>

            {duration ? (
              <View style={{ backgroundColor: 'rgba(192, 132, 252, 0.18)', borderColor: 'rgba(192, 132, 252, 0.45)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={11} color="#C084FC" style={{ marginRight: 4 }} />
                <Text style={{ color: '#E9D5FF', fontSize: 10, fontWeight: '800' }}>
                  {duration}s Duration
                </Text>
              </View>
            ) : null}

            {trimEnd && parseInt(trimEnd) > 0 ? (
              <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: 'rgba(245, 158, 11, 0.45)', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Scissors size={11} color="#FBBF24" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FDE68A', fontSize: 10, fontWeight: '800' }}>
                  Trimmed: {parseInt(trimStart || 0)}s–{parseInt(trimEnd)}s
                </Text>
              </View>
            ) : null}
          </View>

          {/* Full Creative Name without truncation */}
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 21, marginBottom: 12, paddingHorizontal: 10 }}>
            {title}
          </Text>

          {/* ── BOTTOM CENTRE: Play / Pause Button ───────────────────────── */}
          <TouchableOpacity 
            onPress={togglePlay}
            activeOpacity={0.82}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: '#7C3AED',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#A855F7',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.65,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {isPlaying ? (
              <Pause size={24} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <Play size={24} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>

        </View>
      </SafeAreaView>

    </View>
  );
});

// ── Fullscreen Image Component ───────────────────────────────────────────────
const FullscreenImageViewer = memo(({ uri, title, onClose }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'space-between' }}>
      
      {/* ── TOP BAR: Badge (Left) | Title (Centre) | Back/Close (Right) ─────── */}
      <SafeAreaView edges={['top']} style={{ zIndex: 30 }}>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 }}>
          
          {/* Top Left: Static Image badge */}
          <View style={{ minWidth: 80, alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: 'rgba(192, 132, 252, 0.2)', borderColor: 'rgba(192, 132, 252, 0.4)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
              <ImageIcon size={12} color="#C084FC" style={{ marginRight: 4 }} />
              <Text style={{ color: '#E9D5FF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Static Image
              </Text>
            </View>
          </View>

          {/* Top Centre: Visual High-Res tag */}
          <View style={{ alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
              <Text style={{ color: '#CBD5E1', fontSize: 11, fontWeight: '700' }}>
                Full Preview
              </Text>
            </View>
          </View>

          {/* Top Right: Close Button */}
          <View style={{ minWidth: 80, alignItems: 'flex-end' }}>
            <TouchableOpacity 
              onPress={onClose}
              activeOpacity={0.75}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <X size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>

      {/* ── CENTER IMAGE CANVAS ─────────────────────────────────────────────── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        <Image 
          source={{ uri }} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="contain" 
        />
      </View>

      {/* ── BOTTOM AREA: Full title display ─────────────────────────────────── */}
      <SafeAreaView edges={['bottom']} style={{ zIndex: 30 }}>
        <View style={{ backgroundColor: 'rgba(10, 8, 20, 0.94)', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.12)', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 21 }}>
            {title}
          </Text>
        </View>
      </SafeAreaView>

    </View>
  );
});

// ── Master Fullscreen Media Viewer Modal ─────────────────────────────────────
export default function FullscreenMediaViewer({ visible, media, onClose, onTrimPress }) {
  if (!visible || !media) return null;

  const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL || 'https://coxcred.com/srads/api';

  const isVideo = media.media_type === 'video' || media.type === 'video' || (media.file_url && media.file_url.toLowerCase().endsWith('.mp4'));
  const rawUrl = media.file_url;
  const mediaUri = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${getBaseUrl().replace('/api', '')}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`) : null;
  const displayTitle = media.ad_title || media.title || media.campaign_name || 'Creative Preview';
  const duration = media.play_duration || media.duration || 20;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {isVideo ? (
        <FullscreenVideoPlayer 
          uri={mediaUri}
          title={displayTitle}
          duration={duration}
          trimStart={media.video_trim_start}
          trimEnd={media.video_trim_end}
          canTrim={media.canTrim !== false}
          onTrimPress={() => {
            onClose();
            onTrimPress?.(media);
          }}
          onClose={onClose}
        />
      ) : (
        <FullscreenImageViewer 
          uri={mediaUri}
          title={displayTitle}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
