
import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Platform,
  ScrollView,
  TextInput,
  Modal
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
  const { state, actions } = useAppContext();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'speed' | 'locked'>('speed');
  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | 50>(25);
  const [selectedSlotEvery, setSelectedSlotEvery] = useState<number>(30);
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sessionEfficiency, setSessionEfficiency] = useState<number>(75);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [sessionMood, setSessionMood] = useState<number>(3);
  const [sessionFeedback, setSessionFeedback] = useState<string>('');

  useEffect(() => {
    // Initialize with current state values
    setSelectedMode(state.session.mode);
    setSelectedDuration(state.session.targetDuration as 15 | 30 | 50);
    setSelectedSlotEvery(state.session.slotEveryMinutes);
    setSelectedSpeed(state.session.speedSetting);
  }, [
    state.session.mode, 
    state.session.targetDuration, 
    state.session.slotEveryMinutes, 
    state.session.speedSetting
  ]);

  const handleModeChange = (mode: 'speed' | 'locked') => {
    setSelectedMode(mode);
  };

  const handleTimeSlotChange = (duration: 15 | 30 | 50) => {
    setSelectedDuration(duration);
  };

  const handleSlotEveryChange = (minutes: number) => {
    setSelectedSlotEvery(minutes);
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
  };

  const handleStartSession = async () => {
    try {
      console.log('Starting session with:', {
        mode: selectedMode,
        duration: selectedDuration,
        speed: selectedSpeed,
        slotEvery: selectedSlotEvery,
      });

      // Update session settings
      actions.dispatch({
        type: 'UPDATE_SESSION',
        payload: {
          mode: selectedMode,
          targetDuration: selectedDuration,
          speedSetting: selectedSpeed,
          slotEveryMinutes: selectedSlotEvery,
        },
      });

      // Start the session in the database
      await actions.startSession(selectedMode, selectedDuration);

      // Configure clock service
      clockService.setMode(selectedMode);
      clockService.setSpeedMultiplier(selectedSpeed);

      // Start sounds if enabled
      if (state.sounds.master) {
        if (state.sounds.ticking.enabled) {
          soundService.playSound('ticking', state.sounds.ticking.selectedSound);
        }
        if (state.sounds.breathing.enabled) {
          soundService.playSound('breathing', state.sounds.breathing.selectedSound);
        }
        if (state.sounds.nature.enabled) {
          soundService.playSound('nature', state.sounds.nature.selectedSound);
        }
      }

      clockService.start();
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    }
  };

  const handleEndSession = () => {
    const actualDuration = Math.floor((Date.now() - (state.session.startTime?.getTime() || Date.now())) / 1000);
    
    // Stop clock and sounds
    clockService.stop();
    soundService.forceStopAll();

    // Show completion modal
    setShowCompletionModal(true);
  };

  const handleSaveSession = async () => {
    try {
      const actualDuration = Math.floor((Date.now() - (state.session.startTime?.getTime() || Date.now())) / 1000);
      
      console.log('Saving session with:', {
        duration: actualDuration,
        efficiency: sessionEfficiency,
        notes: sessionNotes,
        mood: sessionMood,
        feedback: sessionFeedback,
      });

      await actions.endSession(
        actualDuration,
        sessionEfficiency,
        sessionNotes,
        sessionMood,
        sessionFeedback
      );

      setShowCompletionModal(false);
      
      // Reset form
      setSessionEfficiency(75);
      setSessionNotes('');
      setSessionMood(3);
      setSessionFeedback('');

      Alert.alert(
        'Session Complete!',
        `Great job! You completed a ${Math.round(actualDuration / 60)} minute session.`,
        [
          {
            text: 'View Stats',
            onPress: () => router.push('/(tabs)/stats'),
          },
          {
            text: 'Go Home',
            onPress: () => router.push('/(tabs)/(home)'),
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  const handleSoundToggle = async (soundType: 'ticking' | 'breathing' | 'nature') => {
    const currentSound = state.sounds[soundType];
    const newEnabled = !currentSound.enabled;

    await actions.updateSounds({
      [soundType]: {
        ...currentSound,
        enabled: newEnabled,
      },
    });

    if (state.sounds.master && state.session.isActive) {
      if (newEnabled) {
        soundService.playSound(soundType, currentSound.selectedSound);
      } else {
        soundService.stopSound(soundType);
      }
    }
  };

  const getMoodEmoji = (mood: number): string => {
    const moods = ['😔', '😐', '🙂', '😊', '😄'];
    return moods[mood - 1] || '🙂';
  };

  const getTimeSlotDuration = (multiplier: 1 | 2 | 3): number => {
    const baseDuration = 15; // Base 15 minutes
    return baseDuration * multiplier;
  };

  if (!state.isInitialized) {
    return (
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Focus Session",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
      )}
      
      <ScrollView 
        style={commonStyles.container}
        contentContainerStyle={[
          commonStyles.scrollContent,
          Platform.OS !== 'ios' && styles.contentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {state.session.isActive ? (
          // Active Session View
          <>
            <View style={[commonStyles.goldCard, styles.activeSessionCard]}>
              <Text style={styles.activeSessionTitle}>Session in Progress</Text>
              <Text style={styles.activeSessionMode}>
                {state.session.mode === 'speed' ? '⚡ Speed Mode' : '🔒 Locked Mode'}
              </Text>
              
              <ClockDisplay onSessionComplete={handleEndSession} />
              
              <TouchableOpacity 
                style={[commonStyles.metallicButton, commonStyles.bronzeButton, styles.endButton]}
                onPress={handleEndSession}
              >
                <IconSymbol name="stop.circle.fill" color={colors.text} size={20} />
                <Text style={styles.endButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>

            {/* Live Sound Controls */}
            <View style={[commonStyles.silverCard]}>
              <Text style={commonStyles.subtitle}>Live Sound Controls</Text>
              
              <View style={styles.soundControls}>
                <TouchableOpacity
                  style={[
                    styles.soundButton,
                    state.sounds.ticking.enabled && styles.soundButtonActive,
                  ]}
                  onPress={() => handleSoundToggle('ticking')}
                >
                  <IconSymbol name="clock" color={colors.text} size={20} />
                  <Text style={styles.soundButtonText}>Ticking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.soundButton,
                    state.sounds.breathing.enabled && styles.soundButtonActive,
                  ]}
                  onPress={() => handleSoundToggle('breathing')}
                >
                  <IconSymbol name="lungs" color={colors.text} size={20} />
                  <Text style={styles.soundButtonText}>Breathing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.soundButton,
                    state.sounds.nature.enabled && styles.soundButtonActive,
                  ]}
                  onPress={() => handleSoundToggle('nature')}
                >
                  <IconSymbol name="leaf" color={colors.text} size={20} />
                  <Text style={styles.soundButtonText}>Nature</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          // Session Setup View
          <>
            {/* Mode Selection */}
            <View style={[commonStyles.goldCard]}>
              <Text style={commonStyles.subtitle}>Session Mode</Text>
              
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    selectedMode === 'speed' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange('speed')}
                >
                  <IconSymbol name="bolt.fill" color={colors.text} size={24} />
                  <Text style={styles.modeButtonText}>Speed Mode</Text>
                  <Text style={styles.modeButtonDescription}>Time moves faster</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    selectedMode === 'locked' && styles.modeButtonActive,
                  ]}
                  onPress={() => handleModeChange('locked')}
                >
                  <IconSymbol name="lock.fill" color={colors.text} size={24} />
                  <Text style={styles.modeButtonText}>Locked Mode</Text>
                  <Text style={styles.modeButtonDescription}>Normal time flow</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Selection */}
            <View style={[commonStyles.silverCard]}>
              <Text style={commonStyles.subtitle}>Session Duration</Text>
              
              <View style={styles.durationSelector}>
                {[15, 25, 30, 45, 50].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration && styles.durationButtonActive,
                    ]}
                    onPress={() => handleTimeSlotChange(duration as 15 | 30 | 50)}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      selectedDuration === duration && styles.durationButtonTextActive,
                    ]}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Speed Settings (for Speed Mode) */}
            {selectedMode === 'speed' && (
              <View style={[commonStyles.platinumCard]}>
                <Text style={commonStyles.subtitle}>Speed Multiplier</Text>
                
                <View style={styles.speedSelector}>
                  {[1.0, 1.5, 2.0, 2.5, 3.0].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedButton,
                        selectedSpeed === speed && styles.speedButtonActive,
                      ]}
                      onPress={() => handleSpeedChange(speed)}
                    >
                      <Text style={[
                        styles.speedButtonText,
                        selectedSpeed === speed && styles.speedButtonTextActive,
                      ]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.speedDescription}>
                  Higher speeds make time pass faster, helping you focus for longer periods.
                </Text>
              </View>
            )}

            {/* Sound Preview */}
            <View style={[commonStyles.bronzeCard]}>
              <Text style={commonStyles.subtitle}>Sound Preview</Text>
              
              <View style={styles.soundPreview}>
                <View style={styles.soundPreviewItem}>
                  <IconSymbol name="clock" color={colors.text} size={20} />
                  <Text style={styles.soundPreviewText}>
                    Ticking: {state.sounds.ticking.enabled ? 'On' : 'Off'}
                  </Text>
                </View>
                
                <View style={styles.soundPreviewItem}>
                  <IconSymbol name="lungs" color={colors.text} size={20} />
                  <Text style={styles.soundPreviewText}>
                    Breathing: {state.sounds.breathing.enabled ? 'On' : 'Off'}
                  </Text>
                </View>
                
                <View style={styles.soundPreviewItem}>
                  <IconSymbol name="leaf" color={colors.text} size={20} />
                  <Text style={styles.soundPreviewText}>
                    Nature: {state.sounds.nature.enabled ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[commonStyles.metallicButton, commonStyles.silverButton]}
                onPress={() => router.push('/(tabs)/settings')}
              >
                <IconSymbol name="gear" color={colors.text} size={16} />
                <Text style={styles.settingsButtonText}>Adjust in Settings</Text>
              </TouchableOpacity>
            </View>

            {/* Start Button */}
            <TouchableOpacity 
              style={[commonStyles.metallicButton, commonStyles.goldButton, styles.startButton]}
              onPress={handleStartSession}
            >
              <IconSymbol name="play.circle.fill" color={colors.text} size={24} />
              <Text style={styles.startButtonText}>Start {selectedDuration} Minute Session</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Session Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Session Complete! 🎉</Text>
            <TouchableOpacity onPress={() => setShowCompletionModal(false)}>
              <IconSymbol name="xmark.circle.fill" color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Efficiency Rating */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How efficient was your session?</Text>
              <View style={styles.efficiencySlider}>
                <Text style={styles.efficiencyValue}>{sessionEfficiency}/100</Text>
                {/* Simple efficiency buttons instead of slider */}
                <View style={styles.efficiencyButtons}>
                  {[60, 70, 80, 90, 100].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.efficiencyButton,
                        sessionEfficiency === value && styles.efficiencyButtonActive,
                      ]}
                      onPress={() => setSessionEfficiency(value)}
                    >
                      <Text style={styles.efficiencyButtonText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Session Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="How did the session go? Any distractions or insights?"
                placeholderTextColor={colors.textSecondary}
                multiline
                value={sessionNotes}
                onChangeText={setSessionNotes}
              />
            </View>

            {/* Mood Rating */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How are you feeling?</Text>
              <View style={styles.moodSelector}>
                {[1, 2, 3, 4, 5].map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.moodButton,
                      sessionMood === mood && styles.moodButtonActive,
                    ]}
                    onPress={() => setSessionMood(mood)}
                  >
                    <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Feedback */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Additional Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Any other thoughts or feedback about this session?"
                placeholderTextColor={colors.textSecondary}
                multiline
                value={sessionFeedback}
                onChangeText={setSessionFeedback}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[commonStyles.metallicButton, commonStyles.goldButton, styles.saveButton]}
              onPress={handleSaveSession}
            >
              <IconSymbol name="checkmark.circle.fill" color={colors.text} size={20} />
              <Text style={styles.saveButtonText}>Save Session</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentWithTabBar: {
    paddingBottom: 100,
  },
  activeSessionCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  activeSessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  activeSessionMode: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  soundControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  soundButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
  },
  soundButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  soundButtonText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  modeButtonDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  durationButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  durationButtonTextActive: {
    color: colors.text,
  },
  speedSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  speedButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  speedButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  speedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  speedButtonTextActive: {
    color: colors.text,
  },
  speedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  soundPreview: {
    marginTop: 16,
  },
  soundPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  soundPreviewText: {
    fontSize: 16,
    color: colors.text,
  },
  settingsButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  efficiencySlider: {
    alignItems: 'center',
  },
  efficiencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  efficiencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  efficiencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  efficiencyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  efficiencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.border,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  moodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodEmoji: {
    fontSize: 24,
  },
  feedbackInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
