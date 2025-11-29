
import React, { useState } from "react";
import { useAppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";
import { soundService } from "@/src/services/SoundService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  TextInput
} from "react-native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useTheme } from "@react-navigation/native";
import { GlassView } from "expo-glass-effect";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 100 : 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 24,
    lineHeight: 22,
  },
  masterSoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.metallicChrome,
    boxShadow: '0px 6px 16px rgba(188, 198, 204, 0.4)',
    elevation: 8,
  },
  masterSoundText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleInactive: {
    backgroundColor: colors.border,
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.metallicPlatinum,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  toggleCircleInactive: {
    alignSelf: 'flex-start',
  },
  quickActions: {
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.metallicGold,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 6px 16px rgba(212, 175, 55, 0.3)',
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    backgroundColor: colors.card,
    boxShadow: '0px 4px 8px rgba(192, 192, 192, 0.3)',
    elevation: 6,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  actionChevron: {
    opacity: 0.5,
  },
  progressContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.metallicBronze,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 6px 16px rgba(205, 127, 50, 0.3)',
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  moodContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.metallicPlatinum,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 6px 16px rgba(229, 228, 226, 0.4)',
    elevation: 8,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moodButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    boxShadow: '0px 3px 6px rgba(192, 192, 192, 0.3)',
    elevation: 4,
  },
  moodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.metallicGold,
    boxShadow: '0px 4px 8px rgba(212, 175, 55, 0.4)',
    elevation: 6,
  },
  moodEmoji: {
    fontSize: 24,
  },
  feedbackInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: colors.metallicChrome,
    boxShadow: '0px 3px 6px rgba(188, 198, 204, 0.3)',
    elevation: 4,
  },
  aiSuggestion: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.metallicGold,
    backgroundColor: colors.highlight,
    boxShadow: '0px 6px 16px rgba(212, 175, 55, 0.3)',
    elevation: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  aiText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const theme = useTheme();
  const { state, actions } = useAppContext();
  const { user } = useAuth();

  const handleStartSession = () => {
    router.push('/(tabs)/session');
  };

  const handleViewStats = () => {
    // Navigate to stats screen when implemented
    Alert.alert('Coming Soon', 'Stats screen will be available soon!');
  };

  const handleMasterSoundToggle = async () => {
    actions.updateSounds({ master: !state.sounds.master });
    if (!state.sounds.master) {
      await soundService.initialize();
    } else {
      await soundService.forceStopAll();
    }
  };

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    // You can add logic here to save the mood selection
    console.log('Mood selected:', mood);
  };

  const getMoodEmoji = (mood: number): string => {
    const moods = ['😔', '😐', '🙂', '😊', '😄'];
    return moods[mood - 1] || '🙂';
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.name || state.user.name || 'there';
    
    if (hour < 12) {
      return `Good morning, ${name}!`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}!`;
    } else {
      return `Good evening, ${name}!`;
    }
  };

  const renderHeaderRight = () => (
    <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
      <IconSymbol name="person.circle" size={28} color={colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Focus Flow",
          headerShown: false,
        }} 
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.quote}>
            "The successful warrior is the average person with laser-like focus." - Bruce Lee
          </Text>

          {/* Master Sound Toggle */}
          <GlassView style={styles.masterSoundContainer}>
            <Text style={styles.masterSoundText}>Master Sound</Text>
            <TouchableOpacity
              style={[
                styles.toggle,
                state.sounds.master ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={handleMasterSoundToggle}
            >
              <View
                style={[
                  styles.toggleCircle,
                  state.sounds.master ? styles.toggleCircleActive : styles.toggleCircleInactive,
                ]}
              />
            </TouchableOpacity>
          </GlassView>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleStartSession}>
              <View style={styles.actionIcon}>
                <IconSymbol name="play.circle.fill" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Start Session</Text>
              <View style={styles.actionChevron}>
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleViewStats}>
              <View style={styles.actionIcon}>
                <IconSymbol name="chart.bar.fill" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>View Stats</Text>
              <View style={styles.actionChevron}>
                <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Weekly Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>Weekly Progress</Text>
              <Text style={styles.streakText}>🔥 {state.progress.currentStreak} day streak</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((state.progress.weeklyProgress.reduce((sum, day) => sum + day, 0) / 7) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressLabel}>
              {state.progress.weeklyProgress.reduce((sum, day) => sum + day, 0)} sessions this week
            </Text>
          </View>

          {/* Mood Selection */}
          <View style={styles.moodContainer}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {[1, 2, 3, 4, 5].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && styles.moodButtonActive,
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Feedback Input */}
            <TextInput
              style={styles.feedbackInput}
              placeholder="How was your focus today? Any thoughts or reflections..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
          </View>

          {/* AI Suggestion */}
          {state.feedback.aiSuggestions && (
            <View style={styles.aiSuggestion}>
              <Text style={styles.aiTitle}>💡 Focus Tip</Text>
              <Text style={styles.aiText}>{state.feedback.aiSuggestions}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
