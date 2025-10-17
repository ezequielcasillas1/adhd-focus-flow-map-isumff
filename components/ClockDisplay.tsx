
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { clockService, ClockData } from '@/src/services/ClockService';

interface ClockDisplayProps {
  onSessionComplete?: () => void;
}

export default function ClockDisplay({ onSessionComplete }: ClockDisplayProps) {
  const [clockData, setClockData] = useState<ClockData>(clockService.getCurrentData());

  useEffect(() => {
    const unsubscribe = clockService.subscribe((data: ClockData) => {
      setClockData(data);
    });

    // Get initial data
    setClockData(clockService.getCurrentData());

    return unsubscribe;
  }, [onSessionComplete]);

  const formatTime = (date: Date): string => {
    return clockService.formatTime(date, '12h');
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getTimeAdvantageText = (): string => {
    if (clockData.mode === 'locked') return 'Real Time Mode';
    
    const totalAdvancement = clockData.timeSlotAdvancement;
    const speedAdvantage = clockData.sessionElapsedTime * (clockData.speedMultiplier - 1);
    const totalAdvantage = totalAdvancement + (speedAdvantage / 60); // Convert to minutes
    
    if (totalAdvantage > 0) {
      const hours = Math.floor(totalAdvantage / 60);
      const minutes = Math.floor(totalAdvantage % 60);
      if (hours > 0) {
        return `+${hours}h ${minutes}m ahead`;
      }
      return `+${minutes}m ahead`;
    }
    return 'Real Time';
  };

  const getNextSlotText = (): string => {
    if (!clockData.nextSlotTime || !clockData.isRunning) return '';
    
    const now = new Date();
    const timeUntilSlot = (clockData.nextSlotTime.getTime() - now.getTime()) / 1000;
    
    if (timeUntilSlot <= 0) return 'Applying slot advancement...';
    
    const minutes = Math.floor(timeUntilSlot / 60);
    const seconds = Math.floor(timeUntilSlot % 60);
    
    return `Next +${clockData.timeSlotDuration}m in ${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Main Clock Display */}
      <View style={styles.clockContainer}>
        <Text style={styles.timeText}>{formatTime(clockData.displayTime)}</Text>
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>
            {clockData.mode === 'speed' ? `${clockData.speedMultiplier}x Speed` : 'Locked Mode'}
          </Text>
        </View>
        <Text style={styles.advantageText}>{getTimeAdvantageText()}</Text>
      </View>

      {/* Session Info */}
      {clockData.isRunning && (
        <View style={styles.sessionInfoContainer}>
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoLabel}>Session Duration</Text>
            <Text style={styles.sessionInfoValue}>
              {formatDuration(clockData.sessionElapsedTime)}
            </Text>
          </View>
          
          <View style={styles.sessionInfoCard}>
            <Text style={styles.sessionInfoLabel}>Time Advancement</Text>
            <Text style={styles.sessionInfoValue}>
              +{clockData.timeSlotAdvancement}m
            </Text>
          </View>
        </View>
      )}

      {/* Next Slot Info */}
      {clockData.isRunning && (
        <View style={styles.nextSlotContainer}>
          <Text style={styles.nextSlotText}>{getNextSlotText()}</Text>
          <Text style={styles.slotConfigText}>
            Slot: +{clockData.timeSlotDuration}m every {clockData.slotEveryMinutes}m
          </Text>
        </View>
      )}

      {/* Real Time Comparison */}
      <View style={styles.timeComparisonContainer}>
        <View style={styles.timeComparisonItem}>
          <Text style={styles.timeComparisonLabel}>Real Time</Text>
          <Text style={styles.timeComparisonValue}>
            {formatTime(clockData.realTime)}
          </Text>
        </View>
        <View style={styles.timeComparisonItem}>
          <Text style={styles.timeComparisonLabel}>Display Time</Text>
          <Text style={styles.timeComparisonValue}>
            {formatTime(clockData.displayTime)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  clockContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  modeContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  advantageText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondary,
    marginTop: 8,
  },
  sessionInfoContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 12,
  },
  sessionInfoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sessionInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  nextSlotContainer: {
    width: '100%',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  nextSlotText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotConfigText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeComparisonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  timeComparisonItem: {
    alignItems: 'center',
  },
  timeComparisonLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeComparisonValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
