/**
 * zkRune Receive Screen
 * Display QR code for receiving tokens
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, layout } from '../theme';
import { Card, GradientText } from '../components/ui';
import { useWallet } from '../hooks';

export function ReceiveScreen({ navigation }: any) {
  const { connection, shortenAddress } = useWallet();

  const address = connection?.publicKey || '';

  const handleCopy = async () => {
    if (!address) return;
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  const handleShare = async () => {
    if (!address) return;
    try {
      await Share.share({
        message: `My Solana address: ${address}`,
        title: 'My zkRune Wallet Address',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (!connection) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Receive</GradientText>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Connect your wallet first</Text>
          <TouchableOpacity
            style={styles.connectBtn}
            onPress={() => navigation.navigate('Wallet')}
          >
            <Text style={styles.connectBtnText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Receive</GradientText>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>
          Share your address to receive SOL or zkRUNE tokens
        </Text>

        {/* QR Code Placeholder */}
        <Card style={styles.qrCard}>
          <LinearGradient
            colors={['#ffffff', '#f0f0f0']}
            style={styles.qrContainer}
          >
            {/* QR Code would go here - using placeholder */}
            <View style={styles.qrPlaceholder}>
              <View style={styles.qrInner}>
                <LinearGradient
                  colors={colors.brand.gradient}
                  style={styles.qrLogo}
                >
                  <Text style={styles.qrLogoText}>ᚱ</Text>
                </LinearGradient>
              </View>
              {/* QR pattern simulation */}
              <View style={styles.qrPattern}>
                {[...Array(8)].map((_, row) => (
                  <View key={row} style={styles.qrRow}>
                    {[...Array(8)].map((_, col) => (
                      <View
                        key={col}
                        style={[
                          styles.qrBlock,
                          (row + col) % 3 === 0 && styles.qrBlockFilled,
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.qrNote}>Scan to send tokens</Text>
          </LinearGradient>
        </Card>

        {/* Address Display */}
        <Card style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your Wallet Address</Text>
          <Text style={styles.addressFull} numberOfLines={2}>
            {address}
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
            <LinearGradient
              colors={colors.brand.gradient}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="copy" size={22} color={colors.text.primary} />
              <Text style={styles.actionBtnText}>Copy Address</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.brand.primary} />
            <Text style={styles.actionBtnTextSecondary}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text.tertiary} />
          <Text style={styles.infoText}>
            Only send Solana (SOL) or SPL tokens to this address. Sending other assets may result in permanent loss.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  qrCard: {
    marginBottom: spacing[6],
    padding: 0,
    overflow: 'hidden',
  },
  qrContainer: {
    padding: spacing[6],
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrInner: {
    position: 'absolute',
    zIndex: 10,
  },
  qrLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogoText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  qrPattern: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  qrBlock: {
    width: 16,
    height: 16,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  qrBlockFilled: {
    backgroundColor: '#000000',
  },
  qrNote: {
    ...typography.styles.bodySmall,
    color: '#666666',
    marginTop: spacing[4],
  },
  addressCard: {
    marginBottom: spacing[6],
  },
  addressLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  addressFull: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  actionBtn: {
    flex: 2,
    borderRadius: layout.radius.lg,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
  },
  actionBtnText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
    backgroundColor: colors.brand.primary + '15',
    borderRadius: layout.radius.lg,
  },
  actionBtnTextSecondary: {
    ...typography.styles.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.md,
  },
  infoText: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    flex: 1,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
  },
  connectBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: layout.radius.lg,
  },
  connectBtnText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
