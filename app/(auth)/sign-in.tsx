
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { GlassView } from 'expo-glass-effect';
import { supabase } from '@/app/integrations/supabase/client';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signInButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  googleButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  googleButtonCustom: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  configNotice: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  configNoticeText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Configure Google Sign-In
  React.useEffect(() => {
    // Get Google Web Client ID from environment
    const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_ACTUAL_GOOGLE_WEB_CLIENT_ID_HERE';
    
    console.log('Google Sign-In: Checking configuration...', {
      hasClientId: !!GOOGLE_WEB_CLIENT_ID,
      isPlaceholder: GOOGLE_WEB_CLIENT_ID === 'YOUR_ACTUAL_GOOGLE_WEB_CLIENT_ID_HERE'
    });
    
    // Check if Google Client ID is properly configured
    if (GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID !== 'YOUR_ACTUAL_GOOGLE_WEB_CLIENT_ID_HERE') {
      try {
        GoogleSignin.configure({
          webClientId: GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
        });
        setGoogleConfigured(true);
        console.log('Google Sign-In: Configured successfully');
      } catch (error) {
        console.error('Google Sign-In: Configuration failed:', error);
        setGoogleConfigured(false);
      }
    } else {
      console.log('Google Sign-In: Not configured - missing or placeholder client ID');
      setGoogleConfigured(false);
    }
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'Please enter your email';
      isValid = false;
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    if (!password) {
      errors.password = 'Please enter your password';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setValidationErrors({});
    setNeedsEmailConfirmation(false);
    
    try {
      console.log('SignIn: Attempting to sign in user:', { 
        email: email.trim(),
        supabaseUrl: supabase.supabaseUrl,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('SignIn: Response received:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message,
        errorCode: error?.status
      });

      if (error) {
        console.error('SignIn: Authentication error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          setNeedsEmailConfirmation(true);
          setUserEmail(email.trim());
          Alert.alert(
            'Email Not Confirmed',
            `Please check your email (${email.trim()}) and click the confirmation link before signing in.\n\nIf you haven't received the email, check your spam folder or request a new confirmation email.`,
            [
              { text: 'OK' },
              {
                text: 'Resend Email',
                onPress: handleResendConfirmation,
              },
            ]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Invalid Credentials',
            'The email or password you entered is incorrect. Please check your credentials and try again.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          Alert.alert(
            'Too Many Attempts',
            'Too many sign-in attempts. Please wait a few minutes before trying again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Sign In Failed', error.message || 'An error occurred during sign in');
        }
      } else if (data.user && data.session) {
        console.log('SignIn: Authentication successful:', {
          userId: data.user.id,
          email: data.user.email,
          sessionId: data.session.access_token?.substring(0, 20) + '...'
        });
        
        // Small delay to ensure auth context updates
        setTimeout(() => {
          router.replace('/(tabs)/(home)/');
        }, 100);
      } else {
        console.warn('SignIn: Unexpected response - no session returned:', data);
        Alert.alert(
          'Sign In Issue',
          'Authentication completed but no session was created. Please try again or contact support if the problem persists.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('SignIn: Exception during authentication:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 200)
      });
      Alert.alert(
        'Sign In Error', 
        error?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!userEmail && !email.trim()) return;

    const emailToUse = userEmail || email.trim();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('For security purposes')) {
          Alert.alert(
            'Please Wait',
            'For security purposes, please wait a few minutes before requesting another confirmation email.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert(
          'Email Sent!',
          `A new confirmation email has been sent to ${emailToUse}. Please check your inbox and spam folder.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleConfigured) {
      Alert.alert(
        'Google Sign-In Not Available',
        'Google Sign-In is not configured yet. Please use email and password to sign in.'
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          Alert.alert('Google Sign In Failed', error.message);
        } else {
          console.log('Google sign in successful:', data);
          router.replace('/(tabs)/(home)/');
        }
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        Alert.alert('Google Sign In Failed', error.message || 'An unexpected error occurred');
      }
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/reset-password');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <IconSymbol name="chevron.left" size={20} color={colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <GlassView style={styles.glassCard}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your focus journey
            </Text>

            {!googleConfigured && (
              <View style={styles.configNotice}>
                <Text style={styles.configNoticeText}>
                  💡 Google Sign-In is available but needs to be configured with your Google Cloud credentials. For now, you can sign in with email and password.
                </Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  validationErrors.email && styles.inputError,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email && text.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(text.trim())) {
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }
                  }
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              {validationErrors.email ? (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused,
                  validationErrors.password && styles.inputError,
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationErrors.password && text) {
                    setValidationErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              {validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                loading && styles.signInButtonDisabled
              ]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {needsEmailConfirmation && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendConfirmation}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>
                  {loading ? 'Sending...' : 'Resend Confirmation Email'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {googleConfigured ? (
              <View style={styles.googleButton}>
                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.googleButtonCustom}
                onPress={handleGoogleSignIn}
              >
                <IconSymbol name="globe" size={20} color="white" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            )}

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
