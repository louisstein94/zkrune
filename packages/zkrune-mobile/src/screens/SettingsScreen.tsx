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
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, layout } from '../theme';
import { Card, GradientText } from '../components/ui';
import { useBiometric, useNotifications, useWallet, useSolana } from '../hooks';
import { secureStorage, walletService } from '../services';

// External links
const LINKS = {
  terms: 'https://zkrune.com/terms',
  privacy: 'https://zkrune.com/privacy',
  github: 'https://github.com/zkrune/zkrune',
};

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

  const { connection, isConnected, disconnect, shortenAddress, getProviderName, nativeWallet } = useWallet();
  const { network, setNetwork, getNetworkName, isHealthy } = useSolana();

  const [darkMode, setDarkMode] = useState(true);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);

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

  // Handle backup phrase view
  const handleBackupPhrase = async () => {
    if (!nativeWallet?.mnemonic) {
      Alert.alert('Not Available', 'No recovery phrase available for this wallet type.');
      return;
    }
    // Require biometric or PIN authentication first
    if (biometricEnabled) {
      // TODO: Add biometric check
    }
    setMnemonic(nativeWallet.mnemonic);
    setShowBackupModal(true);
  };

  // Copy mnemonic to clipboard
  const handleCopyMnemonic = async () => {
    if (mnemonic) {
      await Clipboard.setStringAsync(mnemonic);
      Alert.alert('Copied', 'Recovery phrase copied to clipboard. Store it safely!');
    }
  };

  // Handle PIN change
  const handleChangePinSubmit = async () => {
    if (newPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    // Save PIN
    await secureStorage.set('zkrune_pin' as any, newPin);
    Alert.alert('Success', 'PIN has been updated');
    setShowPinModal(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  // Open external links
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
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
          subtitle: nativeWallet?.mnemonic ? 'View your recovery phrase' : 'Not available',
          type: 'link' as const,
          onPress: handleBackupPhrase,
          disabled: !nativeWallet?.mnemonic,
        },
        { 
          icon: 'lock-closed', 
          title: 'Change PIN', 
          subtitle: 'Set or update your PIN',
          type: 'link' as const,
          onPress: () => setShowPinModal(true),
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
      ],
    },
    {
      title: 'About',
      items: [
        { 
          icon: 'document-text', 
          title: 'Terms of Service', 
          type: 'link' as const,
          onPress: () => openLink(LINKS.terms),
        },
        { 
          icon: 'shield', 
          title: 'Privacy Policy', 
          type: 'link' as const,
          onPress: () => openLink(LINKS.privacy),
        },
        { 
          icon: 'logo-github', 
          title: 'Open Source', 
          subtitle: 'View on GitHub',
          type: 'link' as const,
          onPress: () => openLink(LINKS.github),
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

      {/* Backup Phrase Modal */}
      <Modal
        visible={showBackupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBackupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recovery Phrase</Text>
              <TouchableOpacity onPress={() => setShowBackupModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={colors.status.warning} />
              <Text style={styles.warningText}>
                Never share your recovery phrase. Anyone with these words can access your wallet.
              </Text>
            </View>

            <View style={styles.mnemonicBox}>
              {mnemonic?.split(' ').map((word, index) => (
                <View key={index} style={styles.wordBadge}>
                  <Text style={styles.wordNumber}>{index + 1}</Text>
                  <Text style={styles.wordText}>{word}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyMnemonic}>
              <Ionicons name="copy-outline" size={20} color={colors.brand.primary} />
              <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change PIN</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="Enter new PIN"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm PIN</Text>
              <TextInput
                style={styles.pinInput}
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="Confirm new PIN"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, (!newPin || !confirmPin) && styles.saveButtonDisabled]}
              onPress={handleChangePinSubmit}
              disabled={!newPin || !confirmPin}
            >
              <Text style={styles.saveButtonText}>Save PIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.xl,
    padding: spacing[5],
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: colors.status.warning + '15',
    padding: spacing[3],
    borderRadius: layout.radius.md,
    marginBottom: spacing[4],
  },
  warningText: {
    ...typography.styles.bodySmall,
    color: colors.status.warning,
    flex: 1,
  },
  mnemonicBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  wordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: layout.radius.sm,
    gap: spacing[2],
  },
  wordNumber: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    minWidth: 16,
  },
  wordText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: layout.radius.md,
  },
  copyButtonText: {
    ...typography.styles.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  pinInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.radius.md,
    padding: spacing[4],
    ...typography.styles.body,
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  saveButton: {
    backgroundColor: colors.brand.primary,
    padding: spacing[4],
    borderRadius: layout.radius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
