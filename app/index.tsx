
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { session, loading } = useAuth();

  console.log('Index: Rendering with state:', { 
    hasSession: !!session, 
    loading,
    userId: session?.user?.id 
  });

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          color: colors.text, 
          marginTop: 16, 
          fontSize: 16 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (session) {
    console.log('Index: User authenticated, redirecting to home');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  console.log('Index: No session, redirecting to welcome');
  return <Redirect href="/(auth)/welcome" />;
}
