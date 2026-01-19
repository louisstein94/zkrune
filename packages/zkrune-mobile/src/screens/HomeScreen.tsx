/**
 * zkRune Home Screen - Premium Metallic Design
 * Glassmorphism + Metallic gradients with dynamic data
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWallet, useSolana, useZkProof, usePrice } from '../hooks';

const { width } = Dimensions.get('window');

// zkRune Metallic Color Palette
const colors = {
  bgDark: '#06080F',
  bgMid: '#0A0E18',
  bgLight: '#101624',
  
  gradientStart: '#0EA5E9',
  gradientMid: '#06B6D4',
  gradientEnd: '#14B8A6',
  
  primary: '#06B6D4',
  accent: '#22D3EE',
  rune: '#5EEAD4',
  
  success: '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.2)',
  warning: '#F59E0B',
  error: '#EF4444',
  
  white: '#FFFFFF',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
};

type IconName = keyof typeof Ionicons.glyphMap;

export function HomeScreen({ navigation }: any) {
  const [activeWallet, setActiveWallet] = useState('A');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic data from hooks
  const { 
    isConnected, 
    connection, 
    zkRuneBalance, 
    refreshBalance,
    shortenAddress,
  } = useWallet();
  
  const { isHealthy, network, getNetworkName } = useSolana();
  const { proofHistory } = useZkProof();
  const { zkRunePrice, refresh: refreshPrice } = usePrice();

  // Calculate USD value from live price
  const tokenPrice = zkRunePrice?.price || 0;
  const usdValue = zkRuneBalance * tokenPrice;
  const priceChange = zkRunePrice?.priceChange24h || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshBalance(), refreshPrice()]);
    setIsRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Background Gradients */}
        <LinearGradient
          colors={['#050810', '#0a1020', '#0d1528', '#080e1a']}
          locations={[0, 0.3, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.06)', 'transparent', 'rgba(14, 165, 233, 0.04)']}
          locations={[0, 0.5, 1]}
          style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.avatar}
              >
                <Text style={styles.runeSymbol}>ᚱ</Text>
              </LinearGradient>
              <View style={styles.logoGlow} />
            </View>
            <View>
              <Text style={styles.brandName}>zkRune</Text>
              <Text style={styles.brandTagline}>Privacy Layer</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Scan')}
            >
              <Ionicons name="scan-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.gray400} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
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
            colors={['#0c1525', '#101d30', '#0e1828', '#0a1420']}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <LinearGradient
              colors={['rgba(6,182,212,0.1)', 'transparent', 'rgba(6,182,212,0.03)']}
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
                  name={priceChange >= 0 ? "trending-up" : "trending-down"} 
                  size={12} 
                  color={priceChange >= 0 ? colors.success : colors.error} 
                />
                <Text style={[styles.changePercent, priceChange < 0 && styles.changePercentNegative]}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </Text>
              </View>
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.accent} />
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
            <ActionButton icon="ellipsis-horizontal" label="More" onPress={() => navigation.navigate('Settings')} />
          </View>

          {/* zkRUNE Price Card */}
          <TouchableOpacity 
            style={styles.priceCard}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.15)', 'rgba(14, 165, 233, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.priceCardGradient}
            >
              <View style={styles.priceCardHeader}>
                <View style={styles.priceTokenInfo}>
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    style={styles.priceTokenIcon}
                  >
                    <Text style={styles.priceRuneSymbol}>ᚱ</Text>
                  </LinearGradient>
                  <View>
                    <Text style={styles.priceTokenName}>zkRUNE</Text>
                    <Text style={styles.priceTokenSymbol}>ZKRUNE</Text>
                  </View>
                </View>
                <View style={styles.priceValues}>
                  <Text style={styles.priceAmount}>
                    ${tokenPrice > 0 ? tokenPrice.toFixed(8) : '0.00000000'}
                  </Text>
                  <View style={[
                    styles.priceChangeBadge,
                    priceChange >= 0 ? styles.priceChangePositive : styles.priceChangeNegative
                  ]}>
                    <Ionicons 
                      name={priceChange >= 0 ? 'trending-up' : 'trending-down'} 
                      size={12} 
                      color={priceChange >= 0 ? colors.success : colors.error} 
                    />
                    <Text style={[
                      styles.priceChangeText,
                      { color: priceChange >= 0 ? colors.success : colors.error }
                    ]}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.priceCardFooter}>
                <Text style={styles.priceCardLabel}>Live Price • Helius</Text>
                <View style={styles.priceLiveDot} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Wallet Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.walletScroll}
            contentContainerStyle={styles.walletScrollContent}
          >
            {isConnected && connection ? (
              <WalletCard 
                name="Main Wallet" 
                address={shortenAddress(connection.publicKey)} 
                active={true}
                onPress={() => navigation.navigate('Wallet')}
              />
            ) : (
              <WalletCard 
                name="Connect" 
                address="Tap to connect" 
                active={false}
                onPress={() => navigation.navigate('Wallet')}
              />
            )}
            <WalletCard 
              name="Watch Only" 
              address="Add address" 
              gradient={['#4C1D95', '#7C3AED']}
              active={false}
              onPress={() => {}}
            />
            <TouchableOpacity 
              style={styles.addWalletCard}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Ionicons name="add" size={24} color={colors.gray500} />
            </TouchableOpacity>
          </ScrollView>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity 
              style={[styles.tab, styles.tabActive]}
              onPress={() => navigation.navigate('Wallet')}
            >
              <Ionicons name="wallet" size={16} color={colors.white} />
              <Text style={styles.tabTextActive}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => navigation.navigate('Swap')}
            >
              <Ionicons name="swap-horizontal" size={16} color={colors.gray500} />
              <Text style={styles.tabText}>Exchange</Text>
            </TouchableOpacity>
          </View>

          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <Ionicons 
              name={isHealthy ? "checkmark-circle" : "alert-circle"} 
              size={18} 
              color={isHealthy ? colors.success : colors.warning} 
            />
            <Text style={styles.statusText}>
              {isConnected 
                ? `${proofHistory.length} proofs generated` 
                : 'Connect wallet to get started'
              }
            </Text>
            <TouchableOpacity 
              style={styles.statusAction}
              onPress={() => navigation.navigate(isConnected ? 'ProofTab' : 'Wallet')}
            >
              <Text style={styles.statusActionText}>
                {isConnected ? 'View' : 'Connect'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.gray400} />
            </TouchableOpacity>
          </View>

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
              onPress={() => {}}
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

function WalletCard({ name, address, active, gradient, onPress }: { 
  name: string; 
  address: string; 
  active?: boolean; 
  gradient?: string[];
  onPress: () => void;
}) {
  const cardGradient = gradient || (active 
    ? ['#1e2845', '#2a3455', '#252d48'] 
    : ['#181f35', '#1a2238', '#151c30']
  );
  
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.walletCard, active && styles.walletCardActive]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'transparent']}
          locations={[0, 0.5]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
        <Text style={styles.walletCardName}>{name}</Text>
        <View style={styles.walletCardAddress}>
          <Text style={styles.walletCardAddressText}>{address}</Text>
          <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.5)" />
        </View>
      </LinearGradient>
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
        colors={['#1a2035', '#1e2540', '#181f35']}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
    zIndex: -1,
  },
  runeSymbol: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  brandName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandTagline: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  
  // Balance Card
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  zkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  zkBadgeRune: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  zkBadgeText: {
    color: colors.accent,
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
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  privacyText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 24,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionButtonLabel: {
    color: colors.gray400,
    fontSize: 11,
  },
  
  // Price Card
  priceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  priceCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceTokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceTokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRuneSymbol: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  priceTokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  priceTokenSymbol: {
    fontSize: 12,
    color: colors.gray500,
  },
  priceValues: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'monospace',
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  priceChangePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  priceChangeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCardLabel: {
    fontSize: 11,
    color: colors.gray500,
  },
  priceLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  
  // Wallet Cards
  walletScroll: {
    marginBottom: 16,
  },
  walletScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
  },
  walletCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  walletCardActive: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  walletCardName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  walletCardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletCardAddressText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  addWalletCard: {
    width: 56,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray600,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.gray500,
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 10,
  },
  statusText: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
  },
  statusAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusActionText: {
    color: colors.gray400,
    fontSize: 13,
  },
  
  // Feature Cards
  featureScroll: {
    marginBottom: 16,
  },
  featureScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
  },
  featureCard: {
    width: 180,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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
