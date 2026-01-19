/**
 * zkRune Mobile Navigation
 * Bottom tabs + Stack navigation with Onboarding
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, layout } from '../theme';
import { secureStorage, STORAGE_KEYS } from '../services';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProofScreen } from '../screens/ProofScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { StakingScreen } from '../screens/StakingScreen';
import { SwapScreen } from '../screens/SwapScreen';
import { SendScreen } from '../screens/SendScreen';
import { ReceiveScreen } from '../screens/ReceiveScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ 
  name, 
  focused 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  focused: boolean;
}) {
  if (focused) {
    return (
      <LinearGradient
        colors={colors.brand.gradient}
        style={styles.activeTab}
      >
        <Ionicons name={name} size={24} color={colors.text.primary} />
      </LinearGradient>
    );
  }
  
  return <Ionicons name={name} size={24} color={colors.text.tertiary} />;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProofTab"
        component={ProofScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTab}>
              <LinearGradient
                colors={colors.brand.gradient}
                style={styles.centerTabGradient}
              >
                <Ionicons name="shield-checkmark" size={28} color={colors.text.primary} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'scan' : 'scan-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen 
        name="Proof" 
        component={ProofScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="Staking" 
        component={StakingScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="ScanFull" 
        component={ScanScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen 
        name="Swap" 
        component={SwapScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="Send" 
        component={SendScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen 
        name="Receive" 
        component={ReceiveScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

export function Navigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboarded = await secureStorage.get(STORAGE_KEYS.ONBOARDED);
      // If no onboarding status saved, auto-complete for testing
      if (onboarded === null) {
        await secureStorage.set(STORAGE_KEYS.ONBOARDED, 'true');
        setHasOnboarded(true);
      } else {
        setHasOnboarded(onboarded === 'true');
      }
    } catch {
      setHasOnboarded(true); // Skip onboarding on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasOnboarded(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: colors.border.subtle,
    borderTopWidth: 1,
    height: layout.tabBar.height,
    paddingBottom: layout.tabBar.paddingBottom,
    paddingTop: 12,
  },
  activeTab: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    position: 'absolute',
    top: -20,
  },
  centerTabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default Navigation;
