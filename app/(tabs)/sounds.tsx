
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
import { BlurView } from "expo-blur";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";
import { soundService, SOUND_LIBRARY, SoundDefinition } from "@/src/services/SoundService";
import { testSoundService } from "@/src/services/TestSoundService";

export default function SoundsScreen() {
  const { state, dispatch } = useAppContext();
  const [soundPages, setSoundPages] = React.useState<{
    ticking: number;
    breathing: number;
    nature: number;
  }>({ ticking: 1, breathing: 1, nature: 1 });

  const handleMasterSoundToggle = async () => {
    const newMasterState = !state.sounds.master;
    console.log('Sounds: Toggling master sound to:', newMasterState);
    
    dispatch({
      type: 'UPDATE_SOUNDS',
      payload: { master: newMasterState }
    });
    
    await soundService.setMasterEnabled(newMasterState);
    soundService.playHaptic('medium');
  };

  const handleHapticsToggle = () => {
    const newHapticsState = !state.sounds.haptics;
    console.log('Sounds: Toggling haptics to:', newHapticsState);
    
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
    console.log('Sounds: Toggling sound:', soundType);
    
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
    console.log('Sounds: Changing sound type:', soundCategory, soundId);
    
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
    console.log('Sounds: Previewing sound:', soundId);
    soundService.playHaptic('light');
    
    // Stop any currently playing preview
    await soundService.forceStopAll();
    
    // Play the selected sound for preview (non-looping with automatic fade-out)
    // The sound will play with a 2-second fade-out before its natural end
    await soundService.playSound(soundId, false);
    
    // For very long sounds (>10s), limit preview to 10 seconds
    // The automatic fade will handle sounds <10s perfectly
    // For longer sounds, this ensures preview doesn't run too long
    setTimeout(async () => {
      // Only stop if still playing (might have already finished with auto-fade)
      if (soundService.isPlaying(soundId)) {
        console.log('Sounds: Preview timeout reached, stopping long sound');
        await soundService.stopSound(soundId);
      }
    }, 10000);
  };

  const handleTestHaptics = async () => {
    console.log('Sounds: Testing haptics');
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

  // Pagination helpers
  const SOUNDS_PER_PAGE = 10;
  
  const getPaginatedSounds = (category: 'ticking' | 'breathing' | 'nature') => {
    const allSounds = getSoundsByCategory(category);
    const currentPage = soundPages[category];
    const startIndex = (currentPage - 1) * SOUNDS_PER_PAGE;
    const endIndex = startIndex + SOUNDS_PER_PAGE;
    return allSounds.slice(startIndex, endIndex);
  };

  const getTotalPages = (category: 'ticking' | 'breathing' | 'nature') => {
    const allSounds = getSoundsByCategory(category);
    return Math.ceil(allSounds.length / SOUNDS_PER_PAGE);
  };

  const handlePageChange = (category: 'ticking' | 'breathing' | 'nature', page: number) => {
    setSoundPages(prev => ({ ...prev, [category]: page }));
    soundService.playHaptic('light');
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Sounds",
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
                    Choose Sound ({getSoundsByCategory(soundCategory).length} available):
                  </Text>
                  {getPaginatedSounds(soundCategory).map((sound) => (
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
                  
                  {/* Pagination Controls */}
                  {getTotalPages(soundCategory) > 1 && (
                    <View style={styles.paginationContainer}>
                      <Text style={styles.paginationText}>
                        Page {soundPages[soundCategory]} of {getTotalPages(soundCategory)}
                      </Text>
                      <View style={styles.paginationButtons}>
                        <TouchableOpacity
                          style={[
                            styles.pageButton,
                            soundPages[soundCategory] === 1 && styles.pageButtonDisabled
                          ]}
                          onPress={() => handlePageChange(soundCategory, soundPages[soundCategory] - 1)}
                          disabled={soundPages[soundCategory] === 1}
                        >
                          <IconSymbol 
                            name="chevron.left" 
                            color={soundPages[soundCategory] === 1 ? colors.textSecondary : colors.text} 
                            size={16} 
                          />
                        </TouchableOpacity>
                        
                        {Array.from({ length: getTotalPages(soundCategory) }, (_, i) => i + 1).map(page => (
                          <TouchableOpacity
                            key={page}
                            style={[
                              styles.pageNumberButton,
                              soundPages[soundCategory] === page && styles.pageNumberButtonActive
                            ]}
                            onPress={() => handlePageChange(soundCategory, page)}
                          >
                            <Text style={[
                              styles.pageNumberText,
                              soundPages[soundCategory] === page && styles.pageNumberTextActive
                            ]}>
                              {page}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        
                        <TouchableOpacity
                          style={[
                            styles.pageButton,
                            soundPages[soundCategory] === getTotalPages(soundCategory) && styles.pageButtonDisabled
                          ]}
                          onPress={() => handlePageChange(soundCategory, soundPages[soundCategory] + 1)}
                          disabled={soundPages[soundCategory] === getTotalPages(soundCategory)}
                        >
                          <IconSymbol 
                            name="chevron.right" 
                            color={soundPages[soundCategory] === getTotalPages(soundCategory) ? colors.textSecondary : colors.text} 
                            size={16} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Haptic Testing */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Testing</Text>
          
          <View style={styles.demoNotice}>
            <IconSymbol name="info.circle.fill" color={colors.accent} size={16} />
            <Text style={styles.demoNoticeText}>
              Test haptic feedback on your device. Sounds auto-download in the background on app start.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[commonStyles.metallicButton, commonStyles.silverButton, styles.testButton]}
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
  paginationContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  paginationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 2px 4px rgba(192, 192, 192, 0.3)',
    elevation: 3,
  },
  pageButtonDisabled: {
    opacity: 0.4,
    borderColor: colors.textSecondary,
  },
  pageNumberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 2px 4px rgba(192, 192, 192, 0.3)',
    elevation: 3,
  },
  pageNumberButtonActive: {
    backgroundColor: colors.highlight,
    borderColor: colors.metallicGold,
    boxShadow: '0px 3px 6px rgba(212, 175, 55, 0.4)',
    elevation: 5,
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pageNumberTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
});

