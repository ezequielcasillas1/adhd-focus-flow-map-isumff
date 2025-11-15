
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  TouchableOpacity,
  Dimensions 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAppContext } from "@/src/context/AppContext";

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { state, actions } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await actions.refreshAnalytics();
    setIsRefreshing(false);
  }, [actions]);

  // Refresh analytics when screen comes into focus (navigating to Stats tab)
  useFocusEffect(
    useCallback(() => {
      if (state.isInitialized) {
        console.log('Stats: Screen focused, refreshing analytics');
        handleRefresh();
      }
    }, [state.isInitialized, handleRefresh])
  );

  const formatTime = (minutes: number): string => {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressData = () => {
    return selectedPeriod === 'week' 
      ? state.analytics?.weeklyProgress || [0, 0, 0, 0, 0, 0, 0]
      : state.analytics?.monthlyProgress || Array(30).fill(0);
  };

  const getProgressLabels = () => {
    if (selectedPeriod === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    } else {
      // Show every 5th day for monthly view
      return Array(30).fill(0).map((_, i) => (i + 1) % 5 === 0 ? `${i + 1}` : '');
    }
  };

  const renderProgressChart = () => {
    const data = getProgressData();
    const labels = getProgressLabels();
    const maxValue = Math.max(...data, 1);
    const chartWidth = width - 80;
    const barWidth = chartWidth / data.length - 4;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max((value / maxValue) * 120, 2),
                    width: barWidth,
                    backgroundColor: value > 0 ? colors.primary : colors.border,
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{labels[index]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <Text style={styles.chartLegendText}>
            {selectedPeriod === 'week' ? 'Daily Focus Time (This Week)' : 'Daily Focus Time (Last 30 Days)'}
          </Text>
        </View>
      </View>
    );
  };

  const renderModePreference = () => {
    const speedPercentage = state.analytics?.modePreference.speed || 50;
    const lockedPercentage = state.analytics?.modePreference.locked || 50;

    return (
      <View style={styles.modePreferenceContainer}>
        <View style={styles.modePreferenceBar}>
          <View 
            style={[
              styles.modePreferenceSegment, 
              styles.speedSegment,
              { width: `${speedPercentage}%` }
            ]} 
          />
          <View 
            style={[
              styles.modePreferenceSegment, 
              styles.lockedSegment,
              { width: `${lockedPercentage}%` }
            ]} 
          />
        </View>
        <View style={styles.modePreferenceLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>Speed Mode ({speedPercentage}%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
            <Text style={styles.legendText}>Locked Mode ({lockedPercentage}%)</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!state.isInitialized || state.isLoading) {
    return (
      <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
        <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[commonStyles.safeArea]} edges={['top']}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Statistics",
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerRight: () => (
              <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
                <IconSymbol 
                  name="arrow.clockwise" 
                  size={20} 
                  color={isRefreshing ? colors.textSecondary : colors.text} 
                />
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
        {/* Period Selector */}
        <View style={[commonStyles.silverCard, styles.periodSelector]}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'week' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.periodButtonTextActive,
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'month' && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.periodButtonTextActive,
            ]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={[commonStyles.goldCard]}>
          <Text style={commonStyles.subtitle}>Overview</Text>
          
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <IconSymbol name="clock.fill" color={colors.primary} size={24} />
              </View>
              <Text style={styles.overviewValue}>
                {state.analytics?.totalSessions || 0}
              </Text>
              <Text style={styles.overviewLabel}>Total Sessions</Text>
            </View>
            
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <IconSymbol name="timer" color={colors.secondary} size={24} />
              </View>
              <Text style={styles.overviewValue}>
                {formatTime(state.analytics?.totalTime || 0)}
              </Text>
              <Text style={styles.overviewLabel}>Total Time</Text>
            </View>
            
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <IconSymbol name="flame.fill" color={colors.accent} size={24} />
              </View>
              <Text style={styles.overviewValue}>
                {state.analytics?.currentStreak || 0}
              </Text>
              <Text style={styles.overviewLabel}>Current Streak</Text>
            </View>
            
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <IconSymbol name="trophy.fill" color={colors.primary} size={24} />
              </View>
              <Text style={styles.overviewValue}>
                {state.analytics?.bestStreak || 0}
              </Text>
              <Text style={styles.overviewLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={[commonStyles.platinumCard]}>
          <Text style={commonStyles.subtitle}>Progress Chart</Text>
          {renderProgressChart()}
        </View>

        {/* Performance Metrics */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Performance</Text>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <IconSymbol name="chart.line.uptrend.xyaxis" color={colors.primary} size={20} />
              </View>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceLabel}>Average Session</Text>
                <Text style={styles.performanceValue}>
                  {formatTime(state.analytics?.averageSessionLength || 0)}
                </Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <IconSymbol name="target" color={colors.secondary} size={20} />
              </View>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceLabel}>Completion Rate</Text>
                <Text style={styles.performanceValue}>
                  {state.analytics?.completionRate || 100}%
                </Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <IconSymbol name="gauge.high" color={colors.accent} size={20} />
              </View>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceLabel}>Avg Efficiency</Text>
                <Text style={styles.performanceValue}>
                  {state.analytics?.averageEfficiency || 0}/100
                </Text>
              </View>
            </View>
            
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <IconSymbol name="face.smiling" color={colors.primary} size={20} />
              </View>
              <View style={styles.performanceContent}>
                <Text style={styles.performanceLabel}>Avg Mood</Text>
                <Text style={styles.performanceValue}>
                  {state.analytics?.averageMood ? `${state.analytics.averageMood}/5` : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mode Preference */}
        <View style={[commonStyles.bronzeCard]}>
          <Text style={commonStyles.subtitle}>Session Mode Preference</Text>
          {renderModePreference()}
        </View>

        {/* Goals Section */}
        <View style={[commonStyles.goldCard]}>
          <Text style={commonStyles.subtitle}>Goals & Achievements</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalIcon}>
              <IconSymbol name="target" color={colors.primary} size={20} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>Weekly Goal</Text>
              <Text style={styles.goalDescription}>Complete 7 sessions this week</Text>
              <View style={styles.goalProgress}>
                <View 
                  style={[
                    styles.goalProgressFill, 
                    { width: `${Math.min((state.analytics?.weeklyProgress.reduce((a, b) => a + b, 0) || 0) / 7 * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalIcon}>
              <IconSymbol name="flame.fill" color={colors.accent} size={20} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>Streak Master</Text>
              <Text style={styles.goalDescription}>Maintain a 7-day streak</Text>
              <View style={styles.goalProgress}>
                <View 
                  style={[
                    styles.goalProgressFill, 
                    { width: `${Math.min((state.analytics?.currentStreak || 0) / 7 * 100, 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentWithTabBar: {
    paddingBottom: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: colors.border,
    borderRadius: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.text,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.metallicGold,
    ...Platform.select({
      ios: {
        shadowColor: colors.metallicGold,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    marginBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartLegend: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  performanceGrid: {
    marginTop: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.metallicSilver,
  },
  performanceContent: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modePreferenceContainer: {
    marginTop: 16,
  },
  modePreferenceBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  modePreferenceSegment: {
    height: '100%',
  },
  speedSegment: {
    backgroundColor: colors.primary,
  },
  lockedSegment: {
    backgroundColor: colors.secondary,
  },
  modePreferenceLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.metallicGold,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.metallicGold,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  goalProgress: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
