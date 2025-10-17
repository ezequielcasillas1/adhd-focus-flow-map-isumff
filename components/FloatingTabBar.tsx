
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = 340,
  borderRadius = 28,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const animatedValue = useSharedValue(0);

  // Improved active tab detection with better path matching
  const activeTabIndex = React.useMemo(() => {
    // Find the best matching tab based on the current pathname
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      // Exact route match gets highest score
      if (pathname === tab.route) {
        score = 100;
      }
      // Check if pathname starts with tab route (for nested routes)
      else if (pathname.startsWith(tab.route)) {
        score = 80;
      }
      // Check if pathname contains the tab name
      else if (pathname.includes(tab.name)) {
        score = 60;
      }
      // Check for partial matches in the route
      else if (tab.route.includes('/(tabs)/') && pathname.includes(tab.route.split('/(tabs)/')[1])) {
        score = 40;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    // Default to first tab if no match found
    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 150,
        mass: 0.7,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (containerWidth - 20) / tabs.length; // Account for container padding
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  // Dynamic styles based on theme with beautiful transparency
  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
      ...Platform.select({
        ios: {
          backgroundColor: theme.dark
            ? 'rgba(18, 18, 18, 0.88)'
            : 'rgba(255, 255, 255, 0.82)',
          borderWidth: 1.5,
          borderColor: theme.dark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.1)',
          shadowColor: theme.dark ? '#000000' : '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme.dark ? 0.6 : 0.15,
          shadowRadius: 24,
        },
        android: {
          backgroundColor: theme.dark
            ? 'rgba(18, 18, 18, 0.94)'
            : 'rgba(255, 255, 255, 0.94)',
          elevation: 20,
          borderWidth: 1.5,
          borderColor: theme.dark
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(0, 0, 0, 0.1)',
        },
        web: {
          backgroundColor: theme.dark
            ? 'rgba(18, 18, 18, 0.88)'
            : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: theme.dark
            ? '0 8px 32px rgba(0, 0, 0, 0.7), 0 2px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
            : '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          borderWidth: 1.5,
          borderColor: theme.dark
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: theme.dark
        ? 'rgba(255, 255, 255, 0.18)'
        : 'rgba(0, 0, 0, 0.08)',
      width: `${(100 / tabs.length) - 3}%`,
      borderRadius: borderRadius - 10,
      shadowColor: theme.dark ? '#FFFFFF' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.dark ? 0.15 : 0.08,
      shadowRadius: 8,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? (Platform.OS === 'ios' ? 20 : 32)
        }
      ]}>
        <BlurView
          intensity={Platform.OS === 'web' ? 0 : 95}
          tint={theme.dark ? 'dark' : 'light'}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          {/* Inner glow effect */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: theme.dark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.9)',
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
            }}
          />
          
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
          
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.route)}
                  activeOpacity={0.65}
                >
                  <View style={styles.tabContent}>
                    <IconSymbol
                      name={tab.icon}
                      size={isActive ? 28 : 24}
                      color={
                        isActive 
                          ? (theme.dark ? '#FFFFFF' : '#1A1A1A')
                          : (theme.dark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)')
                      }
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isActive 
                            ? (theme.dark ? '#FFFFFF' : '#1A1A1A')
                            : (theme.dark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)'),
                          fontWeight: isActive ? '700' : '600',
                          fontSize: isActive ? 11 : 10,
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    left: 10,
    bottom: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 76,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    marginTop: 3,
    letterSpacing: 0.3,
  },
});
