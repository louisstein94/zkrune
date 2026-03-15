/**
 * zkRune Home Screen
 * MD3-compliant dark theme — indigo/violet palette
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWallet, useSolana, useZkProof, usePrice } from '../hooks';

const colors = {
  bgDark: '#111827',
  bgMid: '#1F2937',
  bgLight: '#283548',

  gradientStart: '#818CF8',
  gradientMid: '#A78BFA',
  gradientEnd: '#34D399',

  primary: '#818CF8',
  accent: '#34D399',
  rune: '#34D399',

  success: '#34D399',
  successGlow: 'rgba(129, 140, 248, 0.2)',
  warning: '#FBBF24',
  error: '#F87171',

  white: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
};

type IconName = keyof typeof Ionicons.glyphMap;

export function HomeScreen({ navigation }: any) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    isConnected,
    connection,
    zkRuneBalance,
    refreshBalance,
    shortenAddress,
  } = useWallet();

  const { proofHistory } = useZkProof();
  const { zkRunePrice, refresh: refreshPrice } = usePrice();

  const tokenPrice = zkRunePrice?.price || 0;
  const usdValue = zkRuneBalance * tokenPrice;
  const priceChange = zkRunePrice?.priceChange24h || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshBalance(), refreshPrice()]);
    } catch (error) {
      console.error('[Home] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={['#0F1623', '#111827', '#151D2F', '#111827']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(129, 140, 248, 0.04)', 'transparent', 'rgba(167, 139, 250, 0.02)']}
          locations={[0, 0.5, 1]}
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
        />

        {/* Header — logo, price ticker, premium badge, wallet status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.avatar}
            >
              <Text style={styles.runeSymbol}>ᚱ</Text>
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>zkRune</Text>
              <View style={styles.priceTicker}>
                <Text style={styles.priceTickerValue}>
                  ${tokenPrice > 0 ? tokenPrice.toFixed(6) : '0.00'}
                </Text>
                <View style={[
                  styles.priceTickerBadge,
                  priceChange < 0 && styles.priceTickerBadgeNeg,
                ]}>
                  <Ionicons
                    name={priceChange >= 0 ? 'caret-up' : 'caret-down'}
                    size={8}
                    color={priceChange >= 0 ? colors.success : colors.error}
                  />
                  <Text style={[
                    styles.priceTickerChange,
                    priceChange < 0 && styles.priceTickerChangeNeg,
                  ]}>
                    {Math.abs(priceChange).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.premiumBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="diamond-outline" size={16} color={colors.primary} />
            </TouchableOpacity>

            {isConnected && connection ? (
              <TouchableOpacity
                style={styles.walletBadge}
                onPress={() => navigation.navigate('Wallet')}
              >
                <View style={styles.walletDotConnected} />
                <Text style={styles.walletBadgeText}>
                  {shortenAddress(connection.publicKey)}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.connectHeaderBtn}
                onPress={() => navigation.navigate('Wallet')}
              >
                <Ionicons name="wallet-outline" size={14} color={colors.white} />
                <Text style={styles.connectHeaderText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Balance Card */}
          <LinearGradient
            colors={['#151C2C', '#1A2235', '#171E2E', '#141A28']}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <LinearGradient
              colors={['rgba(129,140,248,0.06)', 'transparent', 'rgba(167,139,250,0.03)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.zkBadge}>
              <Text style={styles.zkBadgeRune}>ᚱ</Text>
              <Text style={styles.zkBadgeText}>zkRUNE</Text>
            </View>

            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {zkRuneBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.balanceUsd}>
              ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </Text>
            <View style={styles.changeRow}>
              <View style={[styles.changeBadge, priceChange < 0 && styles.changeBadgeNegative]}>
                <Ionicons
                  name={priceChange >= 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={priceChange >= 0 ? colors.success : colors.error}
                />
                <Text style={[styles.changePercent, priceChange < 0 && styles.changePercentNegative]}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </Text>
              </View>
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                <Text style={styles.privacyText}>Private</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <ActionButton icon="arrow-up" label="Send" onPress={() => navigation.navigate('Send')} />
            <ActionButton icon="arrow-down" label="Receive" onPress={() => navigation.navigate('Receive')} />
            <ActionButton icon="swap-horizontal" label="Swap" onPress={() => navigation.navigate('Swap')} />
            <ActionButton icon="scan" label="Scan" onPress={() => navigation.navigate('Scan')} />
            <ActionButton icon="time" label="History" onPress={() => navigation.navigate('Wallet')} />
            <ActionButton icon="layers" label="Stake" onPress={() => navigation.navigate('Staking')} />
          </View>

          {/* Status */}
          {!isConnected && (
            <TouchableOpacity
              style={styles.connectBanner}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.connectBannerText}>Connect wallet to get started</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.gray400} />
            </TouchableOpacity>
          )}

          {isConnected && proofHistory.length > 0 && (
            <View style={styles.proofBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.proofBannerText}>
                {proofHistory.length} proof{proofHistory.length !== 1 ? 's' : ''} generated
              </Text>
            </View>
          )}

          {/* Feature Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featureScroll}
            contentContainerStyle={styles.featureScrollContent}
          >
            <FeatureCard
              icon="shield-half"
              title="ZK Proof"
              subtitle="Generate Privacy Proof"
              desc="Create zero-knowledge proofs locally. Your data never leaves your device."
              onPress={() => navigation.navigate('ProofTab')}
            />
            <FeatureCard
              icon="flame"
              title="Burn"
              subtitle="Upgrade to Premium"
              desc="Burn zkRUNE tokens to unlock premium features and exclusive access."
              onPress={() => navigation.navigate('Settings')}
            />
            <FeatureCard
              icon="layers"
              title="Stake"
              subtitle="Earn 12% APY"
              desc="Stake your zkRUNE tokens and earn rewards while securing the network."
              onPress={() => navigation.navigate('Staking')}
            />
          </ScrollView>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionButtonIcon}>
        <Ionicons name={icon as IconName} size={18} color={colors.white} />
      </View>
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function FeatureCard({ icon, title, subtitle, desc, onPress }: {
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.featureCard} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={['#151C2C', '#1A2235', '#151C2C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.featureCardHeader}>
        <View style={styles.featureCardIconBg}>
          <Ionicons name={icon as IconName} size={16} color={colors.white} />
        </View>
        <Text style={styles.featureCardTitle}>{title}</Text>
        <View style={styles.featureCardArrow}>
          <Ionicons name="arrow-forward" size={16} color={colors.gray400} />
        </View>
      </View>
      <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
      <Text style={styles.featureCardDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  runeSymbol: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  brandName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Compact price ticker below brand name
  priceTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  priceTickerValue: {
    color: colors.gray400,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  priceTickerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priceTickerBadgeNeg: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  priceTickerChange: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '600',
  },
  priceTickerChangeNeg: {
    color: colors.error,
  },

  // Premium tier badge
  premiumBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Wallet status in header
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  walletDotConnected: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  walletBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  connectHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  connectHeaderText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.1)',
    overflow: 'hidden',
  },
  zkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  zkBadgeRune: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  zkBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  balanceLabel: {
    color: colors.gray400,
    fontSize: 13,
    marginBottom: 4,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  balanceUsd: {
    color: colors.gray400,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 12,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  changePercent: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  changeBadgeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  changePercentNegative: {
    color: colors.error,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  privacyText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionButtonLabel: {
    color: colors.gray400,
    fontSize: 11,
  },

  // Connect / Proof banners
  connectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    gap: 10,
  },
  connectBannerText: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
  },
  proofBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.15)',
    gap: 10,
  },
  proofBannerText: {
    flex: 1,
    color: colors.gray400,
    fontSize: 13,
  },

  // Feature Cards
  featureScroll: {
    marginBottom: 16,
  },
  featureScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
  },
  featureCard: {
    width: 180,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.08)',
    overflow: 'hidden',
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  featureCardIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featureCardArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardSubtitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureCardDesc: {
    color: colors.gray500,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default HomeScreen;
