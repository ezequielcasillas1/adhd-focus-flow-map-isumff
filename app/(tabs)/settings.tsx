
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";
import { soundService, SOUND_LIBRARY, SoundDefinition } from "@/src/services/SoundService";
import { testSoundService } from "@/src/services/TestSoundService";

export default function SettingsScreen() {
  const { state, dispatch } = useAppContext();

  const handleMasterSoundToggle = () => {
    const newMasterState = !state.sounds.master;
    console.log('Settings: Toggling master sound to:', newMasterState);
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: { master: newMasterState }
    });
    
    soundService.setMasterEnabled(newMasterState);
    soundService.playHaptic('medium');
  };

  const handleHapticsToggle = () => {
    const newHapticsState = !state.sounds.haptics;
    console.log('Settings: Toggling haptics to:', newHapticsState);
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: { haptics: newHapticsState }
    });
    
    soundService.setHapticsEnabled(newHapticsState);
    if (newHapticsState) {
      soundService.playHaptic('medium');
    }
  };

  const handleSoundToggle = (soundType: 'ticking' | 'breathing' | 'nature') => {
    console.log('Settings: Toggling sound:', soundType);
    
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
    
    soundService.playHaptic('light');
  };

  const handleSoundTypeChange = (soundCategory: 'ticking' | 'breathing' | 'nature', soundId: string) => {
    console.log('Settings: Changing sound type:', soundCategory, soundId);
    
    const currentSound = state.sounds[soundCategory];
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: {
        [soundCategory]: {
          ...currentSound,
          selectedSound: soundId
        }
      }
    });
    
    soundService.playHaptic('light');
  };

  const handlePreviewSound = async (soundId: string) => {
    console.log('Settings: Previewing sound:', soundId);
    soundService.playHaptic('light');
    
    // Stop any currently playing preview
    await soundService.forceStopAll();
    
    // Play the selected sound for preview (short duration)
    await soundService.playSound(soundId, false);
    
    // Stop after 3 seconds
    setTimeout(async () => {
      await soundService.stopSound(soundId);
    }, 3000);
  };

  const handleSpeedMultiplierChange = (multiplier: number) => {
    console.log('Settings: Changing speed multiplier to:', multiplier);
    
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { speedSetting: multiplier }
    });
    
    soundService.playHaptic('light');
  };

  const handleTimeSlotChange = (multiplier: 1 | 2 | 3) => {
    console.log('Settings: Changing time slot multiplier to:', multiplier);
    
    // Fixed time slot durations: 15 min, 30 min, 50 min
    const timeSlotDurations = { 1: 15, 2: 30, 3: 50 };
    const newTargetDuration = timeSlotDurations[multiplier];
    
    dispatch({
      type: 'UPDATE_SESSION',
      payload: { 
        timeSlotMultiplier: multiplier,
        targetDuration: newTargetDuration
      }
    });
    
    soundService.playHaptic('light');
  };

  const handleTestSounds = async () => {
    console.log('Settings: Testing all sounds');
    soundService.playHaptic('medium');
    await testSoundService.testAllSounds();
  };

  const handleTestHaptics = async () => {
    console.log('Settings: Testing haptics');
    await testSoundService.testHaptics();
  };

  const renderToggle = (enabled: boolean, onToggle: () => void) => (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.toggle,
        { backgroundColor: enabled ? colors.secondary : colors.textSecondary }
      ]}
    >
      <View style={[
        styles.toggleThumb,
        { transform: [{ translateX: enabled ? 20 : 0 }] }
      ]} />
    </TouchableOpacity>
  );

  // Get sounds by category from the sound library
  const getSoundsByCategory = (category: 'ticking' | 'breathing' | 'nature'): SoundDefinition[] => {
    return SOUND_LIBRARY.filter(sound => sound.category === category);
  };

  // Helper function to get the correct time slot duration
  const getTimeSlotDuration = (multiplier: 1 | 2 | 3): number => {
    const timeSlotDurations = { 1: 15, 2: 30, 3: 50 };
    return timeSlotDurations[multiplier];
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Settings",
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
        {/* Master Controls */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Master Controls</Text>
          
          <View style={[commonStyles.spaceBetween, styles.settingRow]}>
            <View style={commonStyles.row}>
              <IconSymbol 
                name={state.sounds.master ? "speaker.wave.3.fill" : "speaker.slash.fill"} 
                color={colors.text} 
                size={24} 
              />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                Master Sound
              </Text>
            </View>
            {renderToggle(state.sounds.master, handleMasterSoundToggle)}
          </View>
          
          <View style={[commonStyles.spaceBetween, styles.settingRow]}>
            <View style={commonStyles.row}>
              <IconSymbol 
                name="hand.tap.fill" 
                color={colors.text} 
                size={24} 
              />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                Haptic Feedback
              </Text>
            </View>
            {renderToggle(state.sounds.haptics, handleHapticsToggle)}
          </View>
        </View>

        {/* Sound Layers */}
        <View style={[commonStyles.goldCard]}>
          <Text style={commonStyles.subtitle}>Sound Layers</Text>
          
          {(['ticking', 'breathing', 'nature'] as const).map((soundCategory) => (
            <View key={soundCategory} style={styles.soundSection}>
              <View style={[commonStyles.spaceBetween, styles.settingRow]}>
                <View style={commonStyles.row}>
                  <IconSymbol 
                    name={
                      soundCategory === 'ticking' ? 'metronome' :
                      soundCategory === 'breathing' ? 'lungs.fill' : 'leaf.fill'
                    } 
                    color={colors.text} 
                    size={24} 
                  />
                  <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                    {soundCategory.charAt(0).toUpperCase() + soundCategory.slice(1)}
                  </Text>
                </View>
                {renderToggle(
                  state.sounds[soundCategory].enabled, 
                  () => handleSoundToggle(soundCategory)
                )}
              </View>
              
              {state.sounds[soundCategory].enabled && (
                <View style={styles.soundTypeContainer}>
                  <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
                    Choose Sound:
                  </Text>
                  {getSoundsByCategory(soundCategory).map((sound) => (
                    <TouchableOpacity
                      key={sound.id}
                      style={[
                        styles.soundOption,
                        state.sounds[soundCategory].selectedSound === sound.id && styles.selectedSoundOption
                      ]}
                      onPress={() => handleSoundTypeChange(soundCategory, sound.id)}
                    >
                      <View style={styles.soundOptionContent}>
                        <View style={styles.soundOptionInfo}>
                          <Text style={[
                            styles.soundOptionTitle,
                            state.sounds[soundCategory].selectedSound === sound.id && styles.selectedSoundOptionTitle
                          ]}>
                            {sound.title}
                          </Text>
                          <Text style={[
                            styles.soundOptionDescription,
                            state.sounds[soundCategory].selectedSound === sound.id && styles.selectedSoundOptionDescription
                          ]}>
                            {sound.description}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.previewButton}
                          onPress={() => handlePreviewSound(sound.id)}
                        >
                          <IconSymbol name="play.fill" color={colors.primary} size={16} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Session Settings */}
        <View style={[commonStyles.platinumCard]}>
          <Text style={commonStyles.subtitle}>Session Settings</Text>
          
          <View style={styles.settingSection}>
            <Text style={[commonStyles.text, { marginBottom: 12 }]}>
              Speed Clock Multipliers
            </Text>
            <View style={styles.speedButtons}>
              {[1.0, 1.5, 2.0, 3.0, 5.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    state.session.speedSetting === speed && styles.selectedSpeedButton
                  ]}
                  onPress={() => handleSpeedMultiplierChange(speed)}
                >
                  <Text style={[
                    styles.speedText,
                    state.session.speedSetting === speed && styles.selectedSpeedText
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={[commonStyles.text, { marginBottom: 12 }]}>
              Time Slot Multipliers
            </Text>
            <View style={styles.timeSlotButtons}>
              {[1, 2, 3].map((multiplier) => (
                <TouchableOpacity
                  key={multiplier}
                  style={[
                    styles.timeSlotButton,
                    state.session.timeSlotMultiplier === multiplier && styles.selectedTimeSlotButton
                  ]}
                  onPress={() => handleTimeSlotChange(multiplier as 1 | 2 | 3)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    state.session.timeSlotMultiplier === multiplier && styles.selectedTimeSlotText
                  ]}>
                    {multiplier}x
                  </Text>
                  <Text style={[
                    styles.timeSlotDuration,
                    state.session.timeSlotMultiplier === multiplier && styles.selectedTimeSlotDuration
                  ]}>
                    {getTimeSlotDuration(multiplier as 1 | 2 | 3)} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={[commonStyles.bronzeCard]}>
          <Text style={commonStyles.subtitle}>Coming Soon</Text>
          
          <View style={[commonStyles.spaceBetween, styles.settingRow, styles.disabledRow]}>
            <View style={commonStyles.row}>
              <IconSymbol 
                name="calendar.badge.clock" 
                color={colors.textSecondary} 
                size={24} 
              />
              <Text style={[commonStyles.textSecondary, { marginLeft: 12 }]}>
                Session Scheduler
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </View>
          
          <View style={[commonStyles.spaceBetween, styles.settingRow, styles.disabledRow]}>
            <View style={commonStyles.row}>
              <IconSymbol 
                name="moon.fill" 
                color={colors.textSecondary} 
                size={24} 
              />
              <Text style={[commonStyles.textSecondary, { marginLeft: 12 }]}>
                Dark Mode
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </View>
        </View>

        {/* Sound Testing */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Sound Testing</Text>
          
          <View style={styles.demoNotice}>
            <IconSymbol name="info.circle.fill" color={colors.accent} size={16} />
            <Text style={styles.demoNoticeText}>
              Demo Mode: Sound actions are logged to console. In production, actual audio files would play from the provided URLs.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[commonStyles.metallicButton, commonStyles.goldButton, styles.testButton]}
            onPress={handleTestSounds}
          >
            <IconSymbol name="speaker.wave.2.fill" color={colors.text} size={20} />
            <Text style={styles.testButtonText}>Test All Sounds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.metallicButton, commonStyles.silverButton, styles.testButton, { marginTop: 12 }]}
            onPress={handleTestHaptics}
          >
            <IconSymbol name="hand.tap.fill" color={colors.text} size={20} />
            <Text style={styles.testButtonText}>Test Haptics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentWithTabBar: {
    paddingBottom: 100,
  },
  settingRow: {
    paddingVertical: 8,
  },
  disabledRow: {
    opacity: 0.6,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.metallicPlatinum,
  },
  comingSoonBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.metallicBronze,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  soundSection: {
    marginVertical: 8,
  },
  soundTypeContainer: {
    marginTop: 12,
    marginLeft: 36,
  },
  soundOption: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
    overflow: 'hidden',
  },
  selectedSoundOption: {
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  soundOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  soundOptionInfo: {
    flex: 1,
  },
  soundOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedSoundOptionTitle: {
    color: colors.text,
  },
  soundOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  selectedSoundOptionDescription: {
    color: colors.text,
  },
  previewButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 2px 4px rgba(192, 192, 192, 0.3)',
    elevation: 3,
  },
  settingSection: {
    marginVertical: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedSpeedText: {
    color: colors.text,
    fontWeight: '600',
  },
  timeSlotButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timeSlotButton: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.metallicBronze,
    boxShadow: '0px 3px 6px rgba(205, 127, 50, 0.3)',
    elevation: 4,
  },
  selectedTimeSlotButton: {
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedTimeSlotText: {
    color: colors.text,
  },
  timeSlotDuration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedTimeSlotDuration: {
    color: colors.text,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
