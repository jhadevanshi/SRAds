import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Dimensions, StyleSheet, SafeAreaView } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { X, Play, Pause, Check } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRACK_WIDTH = SCREEN_WIDTH - 40; // 20 padding on each side
const THUMB_WIDTH = 16;
const MAX_TRACK_WIDTH = TRACK_WIDTH - THUMB_WIDTH * 2;

export default function VideoTrimmer({ uri, originalDurationSec, onSave, onCancel }) {
  const [duration, setDuration] = useState(originalDurationSec || 60);
  const [leftPos, setLeftPos] = useState(0);
  const [rightPos, setRightPos] = useState(MAX_TRACK_WIDTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const previewTimeout = useRef(null);

  useEffect(() => {
    if (originalDurationSec) {
      setDuration(originalDurationSec);
    }
  }, [originalDurationSec]);

  // Use the modern expo-video player
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
  });

  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newPos = leftPos + gestureState.dx;
        if (newPos < 0) newPos = 0;
        if (newPos > rightPos - THUMB_WIDTH) newPos = rightPos - THUMB_WIDTH;
        setLeftPos(newPos);
      },
      onPanResponderRelease: (evt, gestureState) => {
        let newPos = leftPos + gestureState.dx;
        if (newPos < 0) newPos = 0;
        if (newPos > rightPos - THUMB_WIDTH) newPos = rightPos - THUMB_WIDTH;
        setLeftPos(newPos);
        seekToPos(newPos);
      }
    })
  ).current;

  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newPos = rightPos + gestureState.dx;
        if (newPos > MAX_TRACK_WIDTH) newPos = MAX_TRACK_WIDTH;
        if (newPos < leftPos + THUMB_WIDTH) newPos = leftPos + THUMB_WIDTH;
        setRightPos(newPos);
      },
      onPanResponderRelease: (evt, gestureState) => {
        let newPos = rightPos + gestureState.dx;
        if (newPos > MAX_TRACK_WIDTH) newPos = MAX_TRACK_WIDTH;
        if (newPos < leftPos + THUMB_WIDTH) newPos = leftPos + THUMB_WIDTH;
        setRightPos(newPos);
        seekToPos(newPos);
      }
    })
  ).current;

  const startSec = (leftPos / MAX_TRACK_WIDTH) * duration;
  const endSec = (rightPos / MAX_TRACK_WIDTH) * duration;
  const selectedDuration = endSec - startSec;

  const seekToPos = (pos) => {
    if (player) {
      const sec = (pos / MAX_TRACK_WIDTH) * duration;
      player.currentTime = sec;
    }
  };

  const togglePreview = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
      if (previewTimeout.current) clearTimeout(previewTimeout.current);
    } else {
      player.currentTime = startSec;
      player.play();
      setIsPlaying(true);
      
      // Set a strict timeout to stop at the trimmed duration
      previewTimeout.current = setTimeout(() => {
        player.pause();
        player.currentTime = startSec;
        setIsPlaying(false);
      }, selectedDuration * 1000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeout.current) clearTimeout(previewTimeout.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trim Video</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
        />
        
        {/* Play/Pause Overlay */}
        <TouchableOpacity 
          style={styles.playOverlay} 
          onPress={togglePreview}
          activeOpacity={0.8}
        >
          <View style={styles.playBtn}>
            {isPlaying ? <Pause size={32} color="#FFF" /> : <Play size={32} color="#FFF" style={{marginLeft: 4}} />}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.editorContainer}>
        <Text style={styles.instructionText}>Drag handles to select playback region</Text>
        
        <View style={styles.timelineWrapper}>
          <View style={styles.trackBackground} />
          
          {/* Highlighted active region */}
          <View 
            style={[
              styles.trackActive, 
              { 
                left: leftPos + THUMB_WIDTH, 
                width: rightPos - leftPos 
              }
            ]} 
          />
          
          {/* Left Handle */}
          <View 
            style={[styles.handle, { left: leftPos }]} 
            {...leftPanResponder.panHandlers}
          >
            <View style={styles.handleBar} />
          </View>
          
          {/* Right Handle */}
          <View 
            style={[styles.handle, { left: rightPos + THUMB_WIDTH }]} 
            {...rightPanResponder.panHandlers}
          >
            <View style={styles.handleBar} />
          </View>
        </View>

        <View style={styles.timeLabels}>
          <Text style={styles.timeText}>{startSec.toFixed(1)}s</Text>
          <Text style={styles.timeText}>{endSec.toFixed(1)}s</Text>
        </View>

        <View style={styles.durationBox}>
          <Text style={styles.durationLabel}>Selected Duration</Text>
          <Text style={styles.durationValue}>{selectedDuration.toFixed(1)} sec</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.previewBtn} onPress={togglePreview}>
          <Text style={styles.previewBtnText}>{isPlaying ? 'Pause Preview' : '▶ Preview Selection'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={() => onSave({ start: startSec, end: endSec, duration: selectedDuration })}
        >
          <Check size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Use This Video</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#111',
    position: 'relative',
    justifyContent: 'center'
  },
  video: {
    flex: 1,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    padding: 20,
    backgroundColor: '#161B22',
  },
  instructionText: {
    color: '#8B949E',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  timelineWrapper: {
    height: 40,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBackground: {
    height: 24,
    backgroundColor: '#30363D',
    borderRadius: 8,
    marginHorizontal: THUMB_WIDTH,
  },
  trackActive: {
    position: 'absolute',
    height: 24,
    backgroundColor: '#F59E0B',
    opacity: 0.5,
  },
  handle: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: 40,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  handleBar: {
    width: 2,
    height: 20,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: THUMB_WIDTH,
  },
  timeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  durationBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  durationLabel: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  durationValue: {
    color: '#F59E0B',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#0D1117',
    gap: 12,
  },
  previewBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#30363D',
    alignItems: 'center',
  },
  previewBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  }
});
