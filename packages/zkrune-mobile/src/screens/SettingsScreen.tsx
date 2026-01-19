/**
 * zkRune Settings Screen
 * App settings with biometric, notifications, and network preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Card, GradientText } from '../components/ui';
import { useBiometric, useNotifications, useWallet, useSolana } from '../hooks';
import { secureStorage } from '../services';

export function SettingsScreen() {
  const {
    isAvailable: biometricAvailable,
    isEnabled: biometricEnabled,
    biometricName,
    biometricIcon,
    enable: enableBiometric,
    disable: disableBiometric,
  } = useBiometric();

  const {
    isEnabled: notificationsEnabled,
    settings: notificationSettings,
    requestPermissions: requestNotifications,
    updateSettings: updateNotificationSettings,
  } = useNotifications();

  const { connection, isConnected, disconnect, shortenAddress, getProviderName } = useWallet();
  const { network, setNetwork, getNetworkName, isHealthy } = useSolana();

  const [darkMode, setDarkMode] = useState(true);

  // Handle biometric toggle
  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const success = await enableBiometric();
      if (!success) {
        Alert.alert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      await disableBiometric();
    }
  };

  // Handle notifications toggle
  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const success = await requestNotifications();
      if (!success) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings'
        );
      }
    } else {
      await updateNotificationSettings({ enabled: false });
    }
  };

  // Handle network change
  const handleNetworkChange = () => {
    Alert.alert(
      'Select Network',
      'Choose a Solana network',
      [
        { text: 'Mainnet', onPress: () => setNetwork('mainnet-beta') },
        { text: 'Devnet', onPress: () => setNetwork('devnet') },
        { text: 'Testnet', onPress: () => setNetwork('testnet') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Handle clear data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all locally stored data including wallet connections and proof history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await secureStorage.clearAll();
            await disconnect();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  // Handle disconnect
  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnect },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Security',
      items: [
        { 
          icon: biometricIcon as any, 
          title: biometricName, 
          subtitle: biometricAvailable ? 'Secure your app' : 'Not available on this device',
          type: 'toggle' as const,
          value: biometricEnabled,
          onToggle: handleBiometricToggle,
          disabled: !biometricAvailable,
        },
        { 
          icon: 'key', 
          title: 'Backup Phrase', 
          subtitle: 'View your recovery phrase',
          type: 'link' as const,
        },
        { 
          icon: 'lock-closed', 
          title: 'Change PIN', 
          type: 'link' as const,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { 
          icon: 'notifications', 
          title: 'Push Notifications', 
          subtitle: 'Proof verifications, governance',
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: handleNotificationsToggle,
        },
      ],
    },
    {
      title: 'Network',
      items: [
        { 
          icon: 'globe', 
          title: 'Network', 
          subtitle: getNetworkName(network),
          type: 'link' as const,
          onPress: handleNetworkChange,
          status: isHealthy ? 'success' : 'error',
        },
        { 
          icon: 'server', 
          title: 'RPC Endpoint', 
          subtitle: 'Custom RPC settings',
          type: 'link' as const,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { 
          icon: 'moon', 
          title: 'Dark Mode', 
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
        { 
          icon: 'language', 
          title: 'Language', 
          subtitle: 'English',
          type: 'link' as const,
        },
      ],
    },
    {
      title: 'About',
      items: [
        { 
          icon: 'document-text', 
          title: 'Terms of Service', 
          type: 'link' as const,
        },
        { 
          icon: 'shield', 
          title: 'Privacy Policy', 
          type: 'link' as const,
        },
        { 
          icon: 'logo-github', 
          title: 'Open Source', 
          subtitle: 'View on GitHub',
          type: 'link' as const,
        },
        { 
          icon: 'information-circle', 
          title: 'Version', 
          subtitle: '0.2.0 (Build 1)',
          type: 'info' as const,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>Settings</GradientText>
        </View>

        {/* Profile Card */}
        {isConnected && connection && (
          <Card style={styles.profileCard}>
            <View style={styles.profileRow}>
              <LinearGradient
                colors={colors.brand.gradient}
                style={styles.avatar}
              >
                <Ionicons name="person" size={24} color={colors.text.primary} />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.profileAddress}>
                  {shortenAddress(connection.publicKey)}
                </Text>
                <Text style={styles.profileLabel}>
                  {getProviderName(connection.provider)}
                </Text>
              </View>
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card noPadding>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  disabled={item.type === 'toggle' || item.type === 'info' || item.disabled}
                  onPress={item.type === 'link' ? item.onPress : undefined}
                >
                  <View style={[
                    styles.settingIcon,
                    item.disabled && styles.settingIconDisabled,
                  ]}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={22} 
                      color={item.disabled ? colors.text.tertiary : colors.brand.primary} 
                    />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[
                      styles.settingTitle,
                      item.disabled && styles.settingTitleDisabled,
                    ]}>
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <View style={styles.subtitleRow}>
                        {item.status && (
                          <View style={[
                            styles.statusDot,
                            item.status === 'success' && styles.statusDotSuccess,
                            item.status === 'error' && styles.statusDotError,
                          ]} />
                        )}
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      </View>
                    )}
                  </View>
                  {item.type === 'link' && (
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={colors.text.tertiary} 
                    />
                  )}
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      disabled={item.disabled}
                      trackColor={{ 
                        false: colors.background.tertiary, 
                        true: colors.brand.primary + '60',
                      }}
                      thumbColor={item.value ? colors.brand.primary : colors.text.tertiary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            <Text style={styles.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.runeSymbol}>ᚱ</Text>
          <Text style={styles.footerText}>zkRune Mobile v0.2.0</Text>
          <Text style={styles.footerSubtext}>Zero-Knowledge Privacy on Solana</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: layout.screenPadding,
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileCard: {
    marginBottom: spacing[6],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  profileInfo: {
    flex: 1,
  },
  profileAddress: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  profileLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  disconnectBtn: {
    padding: spacing[2],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[3],
    marginLeft: spacing[1],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  settingIconDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  settingTitleDisabled: {
    color: colors.text.tertiary,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.tertiary,
  },
  statusDotSuccess: {
    backgroundColor: colors.status.success,
  },
  statusDotError: {
    backgroundColor: colors.status.error,
  },
  settingSubtitle: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: colors.status.error + '10',
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    borderColor: colors.status.error + '30',
    gap: spacing[2],
  },
  dangerText: {
    ...typography.styles.body,
    color: colors.status.error,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  runeSymbol: {
    fontSize: 32,
    color: colors.brand.primary,
    marginBottom: spacing[2],
    opacity: 0.6,
  },
  footerText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  footerSubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
});
