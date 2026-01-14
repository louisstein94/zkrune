/**
 * zkRune Wallet Screen
 * Wallet connection and token management
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card, GradientText } from '../components/ui';

export function WalletScreen() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    // Open Phantom deep link
    setIsConnected(true);
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.connectContainer}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={colors.brand.gradient}
              style={styles.logoGradient}
            >
              <Ionicons name="wallet" size={48} color={colors.text.primary} />
            </LinearGradient>
          </View>
          
          <GradientText style={styles.connectTitle}>Connect Wallet</GradientText>
          
          <Text style={styles.connectDescription}>
            Connect your Solana wallet to access all zkRune features
          </Text>

          <View style={styles.walletOptions}>
            <TouchableOpacity style={styles.walletOption} onPress={handleConnect}>
              <View style={[styles.walletLogo, { backgroundColor: '#AB9FF2' }]}>
                <Text style={styles.walletLogoText}>P</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>Phantom</Text>
                <Text style={styles.walletType}>Recommended</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.walletOption}>
              <View style={[styles.walletLogo, { backgroundColor: '#FC7227' }]}>
                <Text style={styles.walletLogoText}>S</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>Solflare</Text>
                <Text style={styles.walletType}>Mobile & Web</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.securityNote}>
            <Ionicons name="lock-closed" size={14} color={colors.text.secondary} />
            {' '}Your keys never leave your wallet
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>Wallet</GradientText>
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons name="scan" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={colors.brand.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>12,450.00</Text>
          <Text style={styles.balanceToken}>zkRUNE</Text>
          
          <View style={styles.balanceChange}>
            <Ionicons name="trending-up" size={16} color={colors.accent.emerald} />
            <Text style={styles.balanceChangeText}>+5.24% today</Text>
          </View>
        </LinearGradient>

        {/* Address */}
        <Card style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <TouchableOpacity>
              <Ionicons name="copy-outline" size={20} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.address}>7xKX...9fE2</Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[colors.brand.primary + '20', colors.brand.primary + '10']}
              style={styles.actionGradient}
            >
              <Ionicons name="arrow-up" size={24} color={colors.brand.primary} />
            </LinearGradient>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[colors.accent.emerald + '20', colors.accent.emerald + '10']}
              style={styles.actionGradient}
            >
              <Ionicons name="arrow-down" size={24} color={colors.accent.emerald} />
            </LinearGradient>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[colors.accent.amber + '20', colors.accent.amber + '10']}
              style={styles.actionGradient}
            >
              <Ionicons name="flame" size={24} color={colors.accent.amber} />
            </LinearGradient>
            <Text style={styles.actionText}>Burn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[colors.accent.cyan + '20', colors.accent.cyan + '10']}
              style={styles.actionGradient}
            >
              <Ionicons name="layers" size={24} color={colors.accent.cyan} />
            </LinearGradient>
            <Text style={styles.actionText}>Stake</Text>
          </TouchableOpacity>
        </View>

        {/* Tokens */}
        <Text style={styles.sectionTitle}>Your Tokens</Text>
        
        <Card style={styles.tokenCard}>
          <View style={styles.tokenRow}>
            <View style={styles.tokenInfo}>
              <View style={styles.tokenLogo}>
                <Text style={styles.tokenLogoText}>zk</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>zkRUNE</Text>
                <Text style={styles.tokenSymbol}>zkRUNE</Text>
              </View>
            </View>
            <View style={styles.tokenBalance}>
              <Text style={styles.tokenAmount}>12,450.00</Text>
              <Text style={styles.tokenValue}>$1,245.00</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tokenCard}>
          <View style={styles.tokenRow}>
            <View style={styles.tokenInfo}>
              <View style={[styles.tokenLogo, { backgroundColor: '#9945FF' }]}>
                <Text style={styles.tokenLogoText}>S</Text>
              </View>
              <View>
                <Text style={styles.tokenName}>Solana</Text>
                <Text style={styles.tokenSymbol}>SOL</Text>
              </View>
            </View>
            <View style={styles.tokenBalance}>
              <Text style={styles.tokenAmount}>2.45</Text>
              <Text style={styles.tokenValue}>$245.00</Text>
            </View>
          </View>
        </Card>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  logoContainer: {
    marginBottom: spacing[8],
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing[3],
  },
  connectDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  walletOptions: {
    width: '100%',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  walletLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  walletLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  walletType: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  securityNote: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  balanceCard: {
    borderRadius: layout.radius.xl,
    padding: spacing[6],
    marginBottom: spacing[4],
  },
  balanceLabel: {
    ...typography.styles.label,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[2],
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  balanceToken: {
    ...typography.styles.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing[4],
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  balanceChangeText: {
    ...typography.styles.bodySmall,
    color: colors.accent.emerald,
    fontWeight: '500',
  },
  addressCard: {
    marginBottom: spacing[6],
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  addressLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
  },
  address: {
    ...typography.styles.mono,
    color: colors.text.primary,
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  actionButton: {
    alignItems: 'center',
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  actionText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  tokenCard: {
    marginBottom: spacing[3],
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  tokenLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tokenName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tokenSymbol: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tokenValue: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
});
