
import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  TouchableOpacity,
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";
import { useAuth } from "@/src/context/AuthContext";

export default function ProfileScreen() {
  const { state, actions } = useAppContext();
  const { user, signOut } = useAuth();

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAverageSessionLength = (): number => {
    return state.analytics?.averageSessionLength || 0;
  };

  const getBestStreak = (): number => {
    return state.analytics?.bestStreak || 0;
  };

  const getThisWeekTotal = (): number => {
    if (!state.analytics?.weeklyProgress) return 0;
    return state.analytics.weeklyProgress.reduce((sum, minutes) => sum + minutes, 0);
  };

  const handleSignOut = async (): Promise<void> => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('ProfileScreen: User confirmed sign out, calling signOut...');
              await signOut();
            } catch (error) {
              console.error('ProfileScreen: Error signing out:', error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const getUserInitials = (): string => {
    const name = user?.user_metadata?.name || state?.user?.name || 'User';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleRefreshData = async () => {
    try {
      await actions.refreshAnalytics();
      await actions.loadRecentHistory();
      Alert.alert('Success', 'Profile data refreshed!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  // Add safety check for state
  if (!state.isInitialized) {
    return (
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Profile",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerRight: () => (
              <TouchableOpacity onPress={handleRefreshData}>
                <IconSymbol name="arrow.clockwise" size={20} color={colors.text} />
              </TouchableOpacity>
            ),
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
        {/* Profile Header */}
        <View style={[commonStyles.goldCard, styles.profileHeader]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.user_metadata?.name || state.user?.name || 'Focus User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || state.user?.email || 'user@example.com'}
          </Text>
          <Text style={styles.memberSince}>
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Quick Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <IconSymbol name="clock.fill" color={colors.primary} size={24} />
              </View>
              <Text style={styles.statValue}>{state.analytics?.totalSessions || 0}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <IconSymbol name="timer" color={colors.secondary} size={24} />
              </View>
              <Text style={styles.statValue}>{formatTime(state.analytics?.totalTime || 0)}</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <IconSymbol name="flame.fill" color={colors.accent} size={24} />
              </View>
              <Text style={styles.statValue}>{state.analytics?.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={[commonStyles.platinumCard]}>
          <Text style={commonStyles.subtitle}>Detailed Statistics</Text>
          
          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="chart.line.uptrend.xyaxis" color={colors.primary} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>Average Session Length</Text>
              <Text style={styles.detailedStatValue}>{formatTime(getAverageSessionLength())}</Text>
            </View>
          </View>
          
          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="trophy.fill" color={colors.secondary} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>Best Streak</Text>
              <Text style={styles.detailedStatValue}>{getBestStreak()} days</Text>
            </View>
          </View>
          
          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="calendar.badge.clock" color={colors.accent} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>This Week Total</Text>
              <Text style={styles.detailedStatValue}>{formatTime(getThisWeekTotal())}</Text>
            </View>
          </View>
          
          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="gauge.high" color={colors.primary} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>Average Efficiency</Text>
              <Text style={styles.detailedStatValue}>
                {state.analytics?.averageEfficiency ? `${state.analytics.averageEfficiency}/100` : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="face.smiling" color={colors.secondary} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>Average Mood</Text>
              <Text style={styles.detailedStatValue}>
                {state.analytics?.averageMood ? `${state.analytics.averageMood}/5` : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailedStat}>
            <View style={styles.detailedStatIcon}>
              <IconSymbol name="target" color={colors.accent} size={20} />
            </View>
            <View style={styles.detailedStatContent}>
              <Text style={styles.detailedStatLabel}>Completion Rate</Text>
              <Text style={styles.detailedStatValue}>
                {state.analytics?.completionRate || 100}%
              </Text>
            </View>
          </View>
        </View>

        {/* Mode Preference */}
        <View style={[commonStyles.bronzeCard]}>
          <Text style={commonStyles.subtitle}>Session Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceIcon}>
              <IconSymbol name="bolt.fill" color={colors.primary} size={20} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Speed Mode</Text>
              <Text style={styles.preferenceValue}>
                {state.analytics?.modePreference.speed || 50}% of sessions
              </Text>
            </View>
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceIcon}>
              <IconSymbol name="lock.fill" color={colors.secondary} size={20} />
            </View>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Locked Mode</Text>
              <Text style={styles.preferenceValue}>
                {state.analytics?.modePreference.locked || 50}% of sessions
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Recent Activity</Text>
          
          {state.history && state.history.length > 0 ? (
            <View style={styles.recentActivity}>
              {state.history.slice(0, 5).map((session, index) => (
                <View key={`session-${session.id || index}`} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <IconSymbol 
                      name={session.mode === 'speed' ? 'bolt.fill' : 'lock.fill'} 
                      color={colors.primary} 
                      size={16} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {session.mode === 'speed' ? 'Speed' : 'Locked'} Session - {formatTime(Math.round(session.duration / 60))}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.activityRating}>
                    <Text style={styles.activityRatingText}>
                      {session.efficiency ? `${session.efficiency}/100` : 'N/A'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="clock.badge.questionmark" color={colors.textSecondary} size={32} />
              <Text style={styles.emptyStateText}>No sessions yet</Text>
              <Text style={styles.emptyStateSubtext}>Start your first focus session to see activity here</Text>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={[commonStyles.goldCard]}>
          <Text style={commonStyles.subtitle}>Account</Text>
          
          <TouchableOpacity 
            style={[commonStyles.metallicButton, commonStyles.silverButton, styles.refreshButton]}
            onPress={handleRefreshData}
          >
            <IconSymbol name="arrow.clockwise" color={colors.text} size={20} />
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[commonStyles.metallicButton, commonStyles.bronzeButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <IconSymbol name="arrow.right.square" color={colors.text} size={20} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.metallicGold,
    ...Platform.select({
      ios: {
        shadowColor: colors.metallicGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.metallicSilver,
    ...Platform.select({
      ios: {
        shadowColor: colors.metallicSilver,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.metallicPlatinum,
  },
  detailedStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
    ...Platform.select({
      ios: {
        shadowColor: colors.metallicSilver,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailedStatContent: {
    flex: 1,
  },
  detailedStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.metallicBronze,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.metallicBronze,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  recentActivity: {
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.metallicSilver,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
    ...Platform.select({
      ios: {
        shadowColor: colors.metallicSilver,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityRating: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.metallicGold,
  },
  activityRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
