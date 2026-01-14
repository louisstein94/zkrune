/**
 * zkRune Settings Screen
 * App settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Card, GradientText } from '../components/ui';

interface SettingItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  type: 'link' | 'toggle' | 'info';
  value?: boolean;
}

export function SettingsScreen() {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const settingsSections = [
    {
      title: 'Security',
      items: [
        { 
          icon: 'finger-print', 
          title: 'Biometric Authentication', 
          subtitle: 'Use Face ID or fingerprint',
          type: 'toggle',
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        { 
          icon: 'key', 
          title: 'Backup Phrase', 
          subtitle: 'View your recovery phrase',
          type: 'link',
        },
        { 
          icon: 'lock-closed', 
          title: 'Change PIN', 
          type: 'link',
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
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: 'Network',
      items: [
        { 
          icon: 'globe', 
          title: 'Network', 
          subtitle: 'Solana Mainnet',
          type: 'link',
        },
        { 
          icon: 'server', 
          title: 'RPC Endpoint', 
          subtitle: 'Custom RPC settings',
          type: 'link',
        },
      ],
    },
    {
      title: 'About',
      items: [
        { 
          icon: 'document-text', 
          title: 'Terms of Service', 
          type: 'link',
        },
        { 
          icon: 'shield', 
          title: 'Privacy Policy', 
          type: 'link',
        },
        { 
          icon: 'logo-github', 
          title: 'Open Source', 
          subtitle: 'View on GitHub',
          type: 'link',
        },
        { 
          icon: 'information-circle', 
          title: 'Version', 
          subtitle: '0.1.0 (Build 1)',
          type: 'info',
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
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.text.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileAddress}>7xKX...9fE2</Text>
              <Text style={styles.profileLabel}>Connected Wallet</Text>
            </View>
            <TouchableOpacity style={styles.disconnectButton}>
              <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        </Card>

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
                  disabled={item.type === 'toggle' || item.type === 'info'}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons 
                      name={item.icon as any} 
                      size={22} 
                      color={colors.brand.primary} 
                    />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
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
          <TouchableOpacity style={styles.dangerButton}>
            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            <Text style={styles.dangerText}>Clear All Data</Text>
          </TouchableOpacity>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary + '20',
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
  },
  profileLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  disconnectButton: {
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
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
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
});
