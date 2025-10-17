
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { GlassView } from 'expo-glass-effect';
import { supabase } from '@/app/integrations/supabase/client';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
});

export default function EmailConfirmedScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConfirmation = async () => {
      try {
        // Check if user is now authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Email confirmation check error:', error);
          setError('Unable to verify email confirmation status.');
        } else if (session) {
          console.log('Email confirmed successfully, user is authenticated');
          setConfirmed(true);
        } else {
          console.log('Email confirmation page loaded but no session found');
          setError('Email confirmation may not have completed. Please try signing in.');
        }
      } catch (err: any) {
        console.error('Exception during confirmation check:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    // Small delay to allow for any auth state updates
    const timer = setTimeout(checkConfirmation, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (confirmed) {
      router.replace('/(tabs)/(home)/');
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  const handleSignIn = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.gradient}
      >
        <GlassView style={styles.glassCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Verifying email confirmation...</Text>
            </View>
          ) : confirmed ? (
            <>
              <View style={styles.iconContainer}>
                <IconSymbol name="checkmark" size={40} color="white" />
              </View>
              <Text style={styles.title}>Email Confirmed!</Text>
              <Text style={styles.message}>
                Your email has been successfully confirmed. You can now access all features of the app.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue to App</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
                <IconSymbol name="exclamationmark.triangle" size={40} color="white" />
              </View>
              <Text style={styles.title}>Confirmation Issue</Text>
              <Text style={styles.message}>
                {error || 'There was an issue confirming your email. Please try signing in or request a new confirmation email.'}
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Go to Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => router.replace('/(auth)/welcome')}
              >
                <Text style={styles.secondaryButtonText}>Back to Welcome</Text>
              </TouchableOpacity>
            </>
          )}
        </GlassView>
      </LinearGradient>
    </View>
  );
}
