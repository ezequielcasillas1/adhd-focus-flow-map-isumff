
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
import { Stack, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useAuth } from "@/src/context/AuthContext";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        {/* Quick Actions */}
        <View style={[commonStyles.platinumCard]}>
          <Text style={commonStyles.subtitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/sounds')}
          >
            <View style={commonStyles.row}>
              <IconSymbol 
                name="speaker.wave.3.fill" 
                color={colors.text} 
                size={24} 
              />
              <Text style={[commonStyles.text, { marginLeft: 12 }]}>
                Sound Settings
              </Text>
            </View>
            <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
          </TouchableOpacity>
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

        {/* Account Actions */}
        <View style={[commonStyles.silverCard]}>
          <Text style={commonStyles.subtitle}>Account</Text>
          
          <TouchableOpacity
            style={[commonStyles.metallicButton, commonStyles.bronzeButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <IconSymbol name="arrow.right.square.fill" color={colors.text} size={20} />
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
  settingRow: {
    paddingVertical: 8,
  },
  disabledRow: {
    opacity: 0.6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
