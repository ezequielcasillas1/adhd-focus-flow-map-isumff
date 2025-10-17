
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";
import { soundService } from "@/src/services/SoundService";
import { clockService } from "@/src/services/ClockService";
import ClockDisplay from "@/components/ClockDisplay";

export default function SessionScreen() {
  const router = useRouter();
  const { state, dispatch } = useAppContext();
  const [isRunning, setIsRunning] = useState(false);

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
          mode: state.session.mode,
          targetDuration: 0 // No target duration for real-time clock
        }
      });
      
      clockService.setMode(state.session.mode);
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

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
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
              
              {/* Mode Selection */}
              <View style={[commonStyles.silverCard]}>
                <Text style={commonStyles.subtitle}>Clock Mode</Text>
                <View style={styles.modeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      state.session.mode === 'speed' && styles.selectedModeButton
                    ]}
                    onPress={() => handleModeChange('speed')}
                  >
                    <IconSymbol name="speedometer" color={colors.text} size={24} />
                    <Text style={styles.modeButtonText}>Speed Mode</Text>
                    <Text style={styles.modeDescription}>Accelerate time flow</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      state.session.mode === 'locked' && styles.selectedModeButton
                    ]}
                    onPress={() => handleModeChange('locked')}
                  >
                    <IconSymbol name="lock.fill" color={colors.text} size={24} />
                    <Text style={styles.modeButtonText}>Real-Time Mode</Text>
                    <Text style={styles.modeDescription}>Normal time flow</Text>
                  </TouchableOpacity>
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
              
              {/* Speed Setting (only for speed mode) */}
              {state.session.mode === 'speed' && (
                <View style={[commonStyles.silverCard]}>
                  <Text style={commonStyles.subtitle}>Time Speed Multiplier</Text>
                  <Text style={styles.description}>
                    How fast time should advance (higher = faster)
                  </Text>
                  <View style={styles.speedButtons}>
                    {[1.0, 1.5, 2.0, 3.0, 5.0].map((speed) => (
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
              )}
              
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
              <ClockDisplay />
              
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
                <Text style={commonStyles.subtitle}>Active Sounds</Text>
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
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  selectedModeButton: {
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  modeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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
