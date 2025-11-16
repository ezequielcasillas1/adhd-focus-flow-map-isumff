
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";
import { soundService } from "@/src/services/SoundService";
import { clockService } from "@/src/services/ClockService";
import ClockDisplay from "@/components/ClockDisplay";
import FullscreenClock from "@/components/FullscreenClock";

export default function SessionScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Check if session is already running
    const clockData = clockService.getCurrentData();
    setIsRunning(clockData.isRunning);
  }, []);

  const handleModeChange = (mode: 'speed' | 'locked') => {
    console.log('Changing mode to:', mode);
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { mode }
    });
    clockService.setMode(mode);
    soundService.playHaptic('light');
  };

  const handleTimeSlotChange = (duration: 15 | 30 | 50) => {
    console.log('Changing time slot duration to:', duration);
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { 
        timeSlotDuration: duration
      }
    });
    clockService.setTimeSlotDuration(duration);
    soundService.playHaptic('light');
  };

  const handleSlotEveryChange = (minutes: number) => {
    console.log('Changing slot every to:', minutes);
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { 
        slotEveryMinutes: minutes
      }
    });
    clockService.setSlotEveryMinutes(minutes);
    soundService.playHaptic('light');
  };

  const handleSpeedChange = (speed: number) => {
    console.log('Changing speed to:', speed);
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { speedSetting: speed }
    });
    clockService.setSpeedMultiplier(speed);
    soundService.playHaptic('light');
  };

  const handleStartSession = () => {
    console.log('Starting session');
    
    if (isRunning) {
      // Stop session
      setIsRunning(false);
      clockService.stop();
      soundService.forceStopAll();
      
      const clockData = clockService.getCurrentData();
      
      // End session
      dispatch({
        type: 'END_SESSION',
        payload: { duration: Math.floor(clockData.sessionElapsedTime) }
      });
      
      Alert.alert(
        "Session Stopped 🛑",
        `Session ended. Duration: ${Math.floor(clockData.sessionElapsedTime / 60)}m ${Math.floor(clockData.sessionElapsedTime % 60)}s`,
        [
          {
            text: "Add Feedback",
            onPress: () => router.push('/(tabs)/(home)/'),
          },
          {
            text: "Start New Session",
            onPress: () => {
              // Reset and allow new session
            },
          },
        ]
      );
    } else {
      // Start session
      setIsRunning(true);
      
      dispatch({
        type: 'START_SESSION',
        payload: {
          mode: 'speed', // Always use speed mode for real-time clock
          targetDuration: 0 // No target duration for real-time clock
        }
      });
      
      // Set mode to speed first
      clockService.setMode('speed');
      // Then set the multiplier and configurations
      clockService.setSpeedMultiplier(state.session.speedSetting);
      clockService.setTimeSlotDuration(state.session.timeSlotDuration || 15);
      clockService.setSlotEveryMinutes(state.session.slotEveryMinutes || 30);
      clockService.start();
      
      // Start sound layers if enabled
      if (state.sounds.master) {
        if (state.sounds.ticking.enabled) {
          soundService.playSound(state.sounds.ticking.selectedSound, true);
        }
        if (state.sounds.breathing.enabled) {
          soundService.playSound(state.sounds.breathing.selectedSound, true);
        }
        if (state.sounds.nature.enabled) {
          soundService.playSound(state.sounds.nature.selectedSound, true);
        }
      }
    }
    
    soundService.playHaptic('medium');
  };

  const handleSoundToggle = (soundType: 'ticking' | 'breathing' | 'nature') => {
    console.log('Toggling sound:', soundType);
    
    const currentSound = state.sounds[soundType];
    const newEnabled = !currentSound.enabled;
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [soundType]: {
          ...currentSound,
          enabled: newEnabled
        }
      }
    });
    
    if (isRunning && state.sounds.master) {
      if (newEnabled) {
        soundService.playSound(currentSound.selectedSound, true);
      } else {
        soundService.stopSound(currentSound.selectedSound);
      }
    }
    
    soundService.playHaptic('light');
  };

  const handleRefreshSounds = async () => {
    console.log('Refreshing active sounds');
    soundService.playHaptic('medium');
    
    if (!isRunning || !state.sounds.master) return;
    
    // Stop all currently playing sounds
    await soundService.forceStopAll();
    
    // Restart all enabled sounds with their current selections
    const soundTypes: ('ticking' | 'breathing' | 'nature')[] = ['ticking', 'breathing', 'nature'];
    for (const soundType of soundTypes) {
      if (state.sounds[soundType].enabled) {
        await soundService.playSound(state.sounds[soundType].selectedSound, true);
      }
    }
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {/* Hide status bar when session is running on iOS */}
      {Platform.OS === 'ios' && isRunning && <StatusBar hidden={true} />}
      
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Real-Time Clock",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
      )}
      
      <ScrollView 
        style={[commonStyles.container]} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.sessionContainer}>
          {!isRunning ? (
            // Pre-Start Configuration
            <View style={styles.configContainer}>
              <Text style={[commonStyles.title, styles.configTitle]}>
                Configure Real-Time Clock
              </Text>
              
              {/* Clock View Selection - Coming Soon */}
              <View style={[commonStyles.bronzeCard, styles.comingSoonCard]}>
                <View style={styles.clockViewHeader}>
                  <Text style={commonStyles.subtitle}>Clock View</Text>
                  <View style={styles.comingSoonBadge}>
                    <IconSymbol name="clock.badge" color={colors.text} size={16} />
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={[styles.description, styles.comingSoonDescription]}>
                  Choose your preferred clock display style
                </Text>
                
                {/* Feature Preview */}
                <View style={styles.featurePreview}>
                  <View style={styles.featurePreviewIcon}>
                    <IconSymbol 
                      name="paintpalette.fill" 
                      color={colors.textSecondary} 
                      size={32} 
                    />
                  </View>
                  <View style={styles.featurePreviewInfo}>
                    <Text style={styles.featurePreviewTitle}>
                      Multiple Clock Styles
                    </Text>
                    <Text style={styles.featurePreviewDescription}>
                      Analog, Digital, 8-Bit Retro, and more clock designs coming soon!
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Time Slot Duration */}
              <View style={[commonStyles.goldCard]}>
                <Text style={commonStyles.subtitle}>Time Slot Duration</Text>
                <Text style={styles.description}>
                  How many minutes to advance time with each slot
                </Text>
                <View style={styles.timeSlotButtons}>
                  {[15, 30, 50].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.timeSlotButton,
                        (state.session.timeSlotDuration || 15) === duration && styles.selectedTimeSlotButton
                      ]}
                      onPress={() => handleTimeSlotChange(duration as 15 | 30 | 50)}
                    >
                      <Text style={styles.timeSlotText}>+{duration}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Slot Every Configuration */}
              <View style={[commonStyles.platinumCard]}>
                <Text style={commonStyles.subtitle}>Apply Slot Every</Text>
                <Text style={styles.description}>
                  How often to apply the time slot advancement
                </Text>
                <View style={styles.slotEveryButtons}>
                  {[15, 30, 45, 60].map((minutes) => (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.slotEveryButton,
                        (state.session.slotEveryMinutes || 30) === minutes && styles.selectedSlotEveryButton
                      ]}
                      onPress={() => handleSlotEveryChange(minutes)}
                    >
                      <Text style={styles.slotEveryText}>{minutes}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Time Speed Multiplier */}
              <View style={[commonStyles.silverCard]}>
                <Text style={commonStyles.subtitle}>Time Speed Multiplier</Text>
                <Text style={styles.description}>
                  How fast time should advance (higher = faster)
                </Text>
                <View style={styles.speedButtons}>
                  {[1, 2, 4, 8].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedButton,
                        state.session.speedSetting === speed && styles.selectedSpeedButton
                      ]}
                      onPress={() => handleSpeedChange(speed)}
                    >
                      <Text style={styles.speedText}>{speed}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Sound Layers */}
              <View style={[commonStyles.goldCard]}>
                <Text style={commonStyles.subtitle}>Sound Layers</Text>
                <View style={styles.soundControls}>
                  {(['ticking', 'breathing', 'nature'] as const).map((soundType) => (
                    <TouchableOpacity
                      key={soundType}
                      style={[
                        styles.soundButton,
                        state.sounds[soundType].enabled && styles.enabledSoundButton
                      ]}
                      onPress={() => handleSoundToggle(soundType)}
                    >
                      <IconSymbol 
                        name={
                          soundType === 'ticking' ? 'metronome' :
                          soundType === 'breathing' ? 'lungs.fill' : 'leaf.fill'
                        } 
                        color={colors.text} 
                        size={20} 
                      />
                      <Text style={styles.soundButtonText}>
                        {soundType.charAt(0).toUpperCase() + soundType.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Start Button */}
              <TouchableOpacity
                style={[commonStyles.metallicButton, commonStyles.goldButton, styles.startButton]}
                onPress={handleStartSession}
              >
                <IconSymbol name="play.fill" color={colors.text} size={32} />
                <Text style={styles.startButtonText}>Start Real-Time Clock</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Running Session
            <View style={styles.runningContainer}>
              {/* Tap clock to enter fullscreen mode */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFullscreen(true)}
              >
                <ClockDisplay />
              </TouchableOpacity>
              
              <View style={[commonStyles.silverCard, styles.sessionInfo]}>
                <Text style={styles.sessionInfoText}>
                  Mode: {state.session.mode === 'speed' ? `${state.session.speedSetting}x Speed` : 'Real-Time'}
                </Text>
                <Text style={styles.sessionInfoText}>
                  Slot: +{state.session.timeSlotDuration || 15}m every {state.session.slotEveryMinutes || 30}m
                </Text>
              </View>
              
              {/* Active Sound Layers */}
              <View style={[commonStyles.platinumCard]}>
                <View style={styles.soundLayerHeader}>
                  <Text style={commonStyles.subtitle}>Active Sounds</Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefreshSounds}
                  >
                    <IconSymbol 
                      name="arrow.clockwise" 
                      color={colors.primary} 
                      size={20} 
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.activeSounds}>
                  {(['ticking', 'breathing', 'nature'] as const).map((soundType) => (
                    <TouchableOpacity
                      key={soundType}
                      style={[
                        styles.activeSoundButton,
                        state.sounds[soundType].enabled && styles.enabledActiveSoundButton
                      ]}
                      onPress={() => handleSoundToggle(soundType)}
                    >
                      <IconSymbol 
                        name={
                          soundType === 'ticking' ? 'metronome' :
                          soundType === 'breathing' ? 'lungs.fill' : 'leaf.fill'
                        } 
                        color={state.sounds[soundType].enabled ? colors.text : colors.textSecondary} 
                        size={16} 
                      />
                      <Text style={[
                        styles.activeSoundText,
                        { color: state.sounds[soundType].enabled ? colors.text : colors.textSecondary }
                      ]}>
                        {soundType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Stop Session Button */}
              <TouchableOpacity
                style={[commonStyles.metallicButton, commonStyles.bronzeButton, styles.endButton]}
                onPress={handleStartSession}
              >
                <IconSymbol name="stop.fill" color={colors.text} size={24} />
                <Text style={styles.endButtonText}>Stop Clock</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Fullscreen Clock Modal */}
      <FullscreenClock
        visible={isFullscreen}
        onClose={() => setIsFullscreen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for floating tab bar
  },
  sessionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  configContainer: {
    flex: 1,
  },
  configTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  comingSoonCard: {
    opacity: 0.7,
  },
  clockViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.metallicBronze,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  comingSoonDescription: {
    opacity: 0.8,
  },
  featurePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.metallicBronze,
    opacity: 0.8,
  },
  featurePreviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  featurePreviewInfo: {
    flex: 1,
  },
  featurePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  featurePreviewDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  timeSlotButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timeSlotButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicBronze,
    boxShadow: '0px 3px 6px rgba(205, 127, 50, 0.3)',
    elevation: 4,
  },
  selectedTimeSlotButton: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  timeSlotText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  slotEveryButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  slotEveryButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicPlatinum,
    boxShadow: '0px 3px 6px rgba(229, 228, 226, 0.3)',
    elevation: 4,
  },
  selectedSlotEveryButton: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  slotEveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  speedButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicChrome,
    boxShadow: '0px 3px 6px rgba(188, 198, 204, 0.3)',
    elevation: 4,
  },
  selectedSpeedButton: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  soundControls: {
    gap: 12,
    marginTop: 12,
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  enabledSoundButton: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  soundButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  runningContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sessionInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sessionInfoText: {
    fontSize: 16,
    color: colors.text,
    marginVertical: 4,
  },
  soundLayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicPlatinum,
    boxShadow: '0px 3px 6px rgba(229, 228, 226, 0.3)',
    elevation: 4,
  },
  activeSounds: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  activeSoundButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  enabledActiveSoundButton: {
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  activeSoundText: {
    fontSize: 12,
    fontWeight: '500',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});
