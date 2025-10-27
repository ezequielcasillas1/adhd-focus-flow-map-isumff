import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface DigitalClockViewProps {
  time: Date;
  variant?: 'modern' | 'lcd';
}

export function DigitalClockView({ time, variant = 'modern' }: DigitalClockViewProps) {
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  };

  const isModern = variant === 'modern';

  return (
    <View style={styles.container}>
      <Text style={[
        styles.timeText,
        isModern ? styles.modernTime : styles.lcdTime
      ]}>
        {formatTime(time)}
      </Text>
      {variant === 'lcd' && (
        <View style={styles.lcdGlow} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  timeText: {
    fontSize: 52,
    fontWeight: '300',
    letterSpacing: 4,
    textAlign: 'center',
  },
  modernTime: {
    color: colors.text,
    fontFamily: 'monospace',
    fontWeight: '200',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  lcdTime: {
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: '700',
    textShadowColor: '#00ff88',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 6,
  },
  lcdGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#00ff88',
    opacity: 0.05,
    borderRadius: 12,
  },
});

