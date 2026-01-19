/**
 * zkRune Mobile - Ultra Premium Edition
 * Inspired by top-tier crypto wallets
 * Copy to https://snack.expo.dev
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Premium Color Palette
const colors = {
  // Dark backgrounds
  bg: '#0A0E1A',
  surface: '#111827',
  card: '#1A1F2E',
  cardAlt: '#1E2435',
  
  // Brand gradient
  gradientStart: '#6366F1',
  gradientMid: '#8B5CF6',
  gradientEnd: '#A855F7',
  
  // Accent
  primary: '#8B5CF6',
  secondary: '#6366F1',
  accent: '#C084FC',
  
  // Status
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Neutrals
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray800: '#1F2937',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch(activeTab) {
      case 'home': return <HomeScreen />;
      case 'proof': return <ProofScreen />;
      case 'wallet': return <WalletScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderScreen()}
      
      {/* Bottom Navigation */}
      <View style={styles.navWrapper}>
        <View style={styles.nav}>
          <NavItem 
            icon="home" 
            active={activeTab === 'home'} 
            onPress={() => setActiveTab('home')} 
          />
          <NavItem 
            icon="shield-checkmark" 
            active={activeTab === 'proof'} 
            onPress={() => setActiveTab('proof')} 
          />
          <NavItem 
            icon="wallet" 
            active={activeTab === 'wallet'} 
            onPress={() => setActiveTab('wallet')} 
          />
          <NavItem 
            icon="settings" 
            active={activeTab === 'settings'} 
            onPress={() => setActiveTab('settings')} 
          />
        </View>
      </View>
    </View>
  );
}

function NavItem({ icon, active, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      {active ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.navActive}
        >
          <Ionicons name={icon} size={22} color={colors.white} />
        </LinearGradient>
      ) : (
        <View style={styles.navInactive}>
          <Ionicons name={`${icon}-outline`} size={22} color={colors.gray500} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function HomeScreen() {
  const [activeWalletTab, setActiveWalletTab] = useState('wallet');
  
  return (
    <View style={styles.screen}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1a1f3a', '#151929', colors.bg]}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>ZK</Text>
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.greeting}>Hello</Text>
                <Text style={styles.username}>zkRune User</Text>
              </View>
            </View>
            <View style={styles.topBarActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search-outline" size={22} color={colors.gray400} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={22} color={colors.gray400} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>$16,850.75</Text>
            <View style={styles.changeRow}>
              <Text style={styles.changeAmount}>+$2,680.26</Text>
              <View style={styles.changeBadge}>
                <Ionicons name="trending-up" size={12} color={colors.success} />
                <Text style={styles.changePercent}>16.16%</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <ActionButton icon="arrow-up" label="Send" />
            <ActionButton icon="arrow-down" label="Receive" />
            <ActionButton icon="swap-horizontal" label="Swap" />
            <ActionButton icon="scan" label="Scan" />
            <ActionButton icon="time" label="History" />
            <ActionButton icon="ellipsis-horizontal" label="More" />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Switcher */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.walletSwitcher}
          contentContainerStyle={styles.walletSwitcherContent}
        >
          <WalletCard 
            name="Main Wallet" 
            address="7xKX...9fE2" 
            active 
          />
          <WalletCard 
            name="Staking" 
            address="3mPq...7nRt" 
            gradient={['#581C87', '#7C3AED']}
          />
          <TouchableOpacity style={styles.addWalletCard}>
            <Ionicons name="add" size={24} color={colors.gray500} />
          </TouchableOpacity>
        </ScrollView>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            style={[styles.tab, activeWalletTab === 'wallet' && styles.tabActive]}
            onPress={() => setActiveWalletTab('wallet')}
          >
            <Ionicons 
              name="wallet" 
              size={16} 
              color={activeWalletTab === 'wallet' ? colors.white : colors.gray500} 
            />
            <Text style={[styles.tabText, activeWalletTab === 'wallet' && styles.tabTextActive]}>
              Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeWalletTab === 'proofs' && styles.tabActive]}
            onPress={() => setActiveWalletTab('proofs')}
          >
            <Ionicons 
              name="shield-checkmark" 
              size={16} 
              color={activeWalletTab === 'proofs' ? colors.white : colors.gray500} 
            />
            <Text style={[styles.tabText, activeWalletTab === 'proofs' && styles.tabTextActive]}>
              ZK Proofs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.statusText}>You're all set</Text>
          <TouchableOpacity style={styles.statusAction}>
            <Text style={styles.statusActionText}>View</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.featureCards}
          contentContainerStyle={styles.featureCardsContent}
        >
          <FeatureCard 
            icon="shield-half"
            iconColor="#8B5CF6"
            title="ZK Proof"
            subtitle="Generate privacy proofs"
            action="Create"
          />
          <FeatureCard 
            icon="layers"
            iconColor="#F59E0B"
            title="Staking"
            subtitle="Earn 12% APY"
            action="Stake"
          />
          <FeatureCard 
            icon="flame"
            iconColor="#EF4444"
            title="Burn"
            subtitle="Upgrade to Pro"
            action="Burn"
          />
        </ScrollView>

        {/* Assets Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assets</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color={colors.gray500} />
          </TouchableOpacity>
        </View>

        <View style={styles.assetsList}>
          <AssetItem 
            symbol="zkRUNE"
            name="zkRune Token"
            amount="12,450.00"
            value="$1,245.00"
            change="+5.24%"
            positive
          />
          <AssetItem 
            symbol="SOL"
            name="Solana"
            amount="14.52"
            value="$2,178.00"
            change="+2.31%"
            positive
          />
          <AssetItem 
            symbol="USDC"
            name="USD Coin"
            amount="500.00"
            value="$500.00"
            change="0.00%"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function ProofScreen() {
  const [selected, setSelected] = useState(null);
  
  const proofs = [
    { id: 'age', icon: 'person', title: 'Age Verification', desc: 'Prove you are above a threshold', gradient: ['#6366F1', '#8B5CF6'] },
    { id: 'balance', icon: 'wallet', title: 'Balance Proof', desc: 'Prove minimum token balance', gradient: ['#8B5CF6', '#A855F7'] },
    { id: 'member', icon: 'people', title: 'Membership', desc: 'Prove group membership', gradient: ['#A855F7', '#C084FC'] },
    { id: 'credential', icon: 'ribbon', title: 'Credential', desc: 'Prove certification status', gradient: ['#6366F1', '#818CF8'] },
    { id: 'vote', icon: 'checkbox', title: 'Private Voting', desc: 'Anonymous governance votes', gradient: ['#7C3AED', '#A855F7'] },
    { id: 'reputation', icon: 'star', title: 'Reputation', desc: 'Anonymous reputation score', gradient: ['#8B5CF6', '#C084FC'] },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Generate Proof</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="information-circle-outline" size={24} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.proofContent}
        >
          {/* Info Banner */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.05)']}
            style={styles.infoBanner}
          >
            <View style={styles.infoBannerIcon}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Zero-Knowledge Privacy</Text>
              <Text style={styles.infoBannerText}>
                Proofs are generated locally. Your data never leaves your device.
              </Text>
            </View>
          </LinearGradient>

          {/* Proof Grid */}
          <View style={styles.proofGrid}>
            {proofs.map((proof) => (
              <TouchableOpacity 
                key={proof.id}
                style={[styles.proofCard, selected === proof.id && styles.proofCardSelected]}
                onPress={() => setSelected(proof.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={proof.gradient}
                  style={styles.proofCardIcon}
                >
                  <Ionicons name={proof.icon} size={22} color={colors.white} />
                </LinearGradient>
                <Text style={styles.proofCardTitle}>{proof.title}</Text>
                <Text style={styles.proofCardDesc}>{proof.desc}</Text>
                {selected === proof.id && (
                  <View style={styles.proofCardCheck}>
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          {selected && (
            <TouchableOpacity activeOpacity={0.8} style={styles.generateWrapper}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtn}
              >
                <Ionicons name="flash" size={20} color={colors.white} />
                <Text style={styles.generateText}>Generate Proof</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function WalletScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Wallet</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="qr-code-outline" size={22} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.walletContent}
        >
          {/* Main Balance Card */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainBalanceCard}
          >
            <View style={styles.mainBalanceHeader}>
              <Text style={styles.mainBalanceLabel}>zkRUNE Balance</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.mainBalanceAmount}>12,450.00</Text>
            <Text style={styles.mainBalanceUsd}>≈ $1,245.00 USD</Text>
            
            <View style={styles.mainBalanceActions}>
              <TouchableOpacity style={styles.mainBalanceBtn}>
                <Ionicons name="arrow-up" size={18} color={colors.white} />
                <Text style={styles.mainBalanceBtnText}>Send</Text>
              </TouchableOpacity>
              <View style={styles.mainBalanceDivider} />
              <TouchableOpacity style={styles.mainBalanceBtn}>
                <Ionicons name="arrow-down" size={18} color={colors.white} />
                <Text style={styles.mainBalanceBtnText}>Receive</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Address Card */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View>
                <Text style={styles.addressLabel}>Wallet Address</Text>
                <Text style={styles.addressValue}>7xKXq8vN...9fE2mP</Text>
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity style={styles.addressBtn}>
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addressBtn}>
                  <Ionicons name="share-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="layers" size={20} color={colors.primary} />
              <Text style={styles.statValue}>4,200</Text>
              <Text style={styles.statLabel}>Staked</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={20} color={colors.warning} />
              <Text style={styles.statValue}>850</Text>
              <Text style={styles.statLabel}>Burned</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Proofs</Text>
            </View>
          </View>

          {/* Transaction History */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            <TransactionItem 
              type="receive"
              title="Received zkRUNE"
              address="From: 3mPq...7nRt"
              amount="+500.00"
              time="2 hours ago"
            />
            <TransactionItem 
              type="send"
              title="Sent zkRUNE"
              address="To: 9xYz...4kLm"
              amount="-120.00"
              time="5 hours ago"
            />
            <TransactionItem 
              type="stake"
              title="Staked zkRUNE"
              address="Lock: 30 days"
              amount="-1,000.00"
              time="1 day ago"
            />
            <TransactionItem 
              type="reward"
              title="Staking Reward"
              address="APY: 12%"
              amount="+12.50"
              time="2 days ago"
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Settings</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.settingsContent}
        >
          {/* Profile Card */}
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileInitials}>ZK</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>zkRune User</Text>
              <Text style={styles.profileAddress}>7xKXq8vN...9fE2mP</Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>PRO</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray500} />
          </TouchableOpacity>

          {/* Settings Groups */}
          <Text style={styles.settingsGroupTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingItem icon="person-circle" title="Profile" />
            <SettingItem icon="wallet" title="Wallets" value="2 wallets" />
            <SettingItem icon="key" title="Recovery Phrase" />
          </View>

          <Text style={styles.settingsGroupTitle}>Security</Text>
          <View style={styles.settingsGroup}>
            <SettingItem icon="finger-print" title="Biometric Lock" hasToggle isOn />
            <SettingItem icon="lock-closed" title="Change PIN" />
            <SettingItem icon="shield-checkmark" title="2FA" value="Enabled" />
          </View>

          <Text style={styles.settingsGroupTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            <SettingItem icon="moon" title="Dark Mode" hasToggle isOn />
            <SettingItem icon="notifications" title="Notifications" />
            <SettingItem icon="language" title="Language" value="English" />
            <SettingItem icon="server" title="Network" value="Mainnet" />
          </View>

          <Text style={styles.settingsGroupTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem icon="help-circle" title="Help Center" />
            <SettingItem icon="chatbubble" title="Contact Us" />
            <SettingItem icon="document-text" title="Terms of Service" />
            <SettingItem icon="shield" title="Privacy Policy" />
          </View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>zkRune Mobile v0.1.0</Text>
            <Text style={styles.versionSubtext}>Built for Solana Privacy Hack 2026</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Component Helpers
function ActionButton({ icon, label }) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
      <View style={styles.actionButtonIcon}>
        <Ionicons name={icon} size={20} color={colors.white} />
      </View>
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function WalletCard({ name, address, active, gradient }) {
  const cardGradient = gradient || (active ? [colors.gradientStart, colors.gradientMid] : [colors.card, colors.cardAlt]);
  
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.walletCard, active && styles.walletCardActive]}
      >
        <Text style={styles.walletCardName}>{name}</Text>
        <View style={styles.walletCardAddress}>
          <Text style={styles.walletCardAddressText}>{address}</Text>
          <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function FeatureCard({ icon, iconColor, title, subtitle, action }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureCardHeader}>
        <View style={[styles.featureCardIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <TouchableOpacity>
          <Ionicons name="arrow-forward" size={18} color={colors.gray500} />
        </TouchableOpacity>
      </View>
      <Text style={styles.featureCardTitle}>{title}</Text>
      <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
    </View>
  );
}

function AssetItem({ symbol, name, amount, value, change, positive }) {
  return (
    <TouchableOpacity style={styles.assetItem} activeOpacity={0.7}>
      <View style={styles.assetItemIcon}>
        <Text style={styles.assetItemSymbol}>{symbol.substring(0, 2)}</Text>
      </View>
      <View style={styles.assetItemInfo}>
        <Text style={styles.assetItemName}>{name}</Text>
        <Text style={styles.assetItemAmount}>{amount} {symbol}</Text>
      </View>
      <View style={styles.assetItemValue}>
        <Text style={styles.assetItemValueText}>{value}</Text>
        <Text style={[
          styles.assetItemChange, 
          positive && { color: colors.success },
          !positive && change !== '0.00%' && { color: colors.error }
        ]}>
          {change}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TransactionItem({ type, title, address, amount, time }) {
  const getIcon = () => {
    switch(type) {
      case 'receive': return 'arrow-down';
      case 'send': return 'arrow-up';
      case 'stake': return 'layers';
      case 'reward': return 'gift';
      default: return 'swap-horizontal';
    }
  };
  
  const getColor = () => {
    switch(type) {
      case 'receive': return colors.success;
      case 'send': return colors.error;
      case 'stake': return colors.primary;
      case 'reward': return colors.warning;
      default: return colors.gray500;
    }
  };

  const isPositive = amount.startsWith('+');

  return (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
      <View style={[styles.transactionIcon, { backgroundColor: getColor() + '15' }]}>
        <Ionicons name={getIcon()} size={18} color={getColor()} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionAddress}>{address}</Text>
      </View>
      <View style={styles.transactionValue}>
        <Text style={[styles.transactionAmount, isPositive && { color: colors.success }]}>
          {amount}
        </Text>
        <Text style={styles.transactionTime}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

function SettingItem({ icon, title, value, hasToggle, isOn, noArrow }) {
  return (
    <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
      <View style={styles.settingItemIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.settingItemTitle}>{title}</Text>
      {value && <Text style={styles.settingItemValue}>{value}</Text>}
      {hasToggle && (
        <View style={[styles.toggle, isOn && styles.toggleOn]}>
          <View style={[styles.toggleThumb, isOn && styles.toggleThumbOn]} />
        </View>
      )}
      {!hasToggle && !noArrow && (
        <Ionicons name="chevron-forward" size={18} color={colors.gray600} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header Gradient
  headerGradient: {
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  greeting: {
    color: colors.gray500,
    fontSize: 13,
  },
  username: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  
  // Balance
  balanceSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  balanceLabel: {
    color: colors.gray500,
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  changeAmount: {
    color: colors.gray400,
    fontSize: 14,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  changePercent: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionButtonLabel: {
    color: colors.gray400,
    fontSize: 12,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
  },
  
  // Wallet Switcher
  walletSwitcher: {
    marginBottom: 16,
  },
  walletSwitcherContent: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
  },
  walletCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  walletCardActive: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  addWalletCard: {
    width: 56,
    height: 80,
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
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
  },
  
  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
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
  featureCards: {
    marginBottom: 24,
  },
  featureCardsContent: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: 'row',
  },
  featureCard: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureCardSubtitle: {
    color: colors.gray500,
    fontSize: 12,
  },
  
  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  
  // Assets
  assetsList: {
    paddingHorizontal: 20,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  assetItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetItemSymbol: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  assetItemInfo: {
    flex: 1,
  },
  assetItemName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  assetItemAmount: {
    color: colors.gray500,
    fontSize: 13,
    marginTop: 2,
  },
  assetItemValue: {
    alignItems: 'flex-end',
  },
  assetItemValueText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  assetItemChange: {
    color: colors.gray500,
    fontSize: 13,
    marginTop: 2,
  },
  
  // Navigation
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingHorizontal: 60,
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navActive: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navInactive: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Screen Header
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  screenTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  
  // Proof Screen
  proofContent: {
    paddingHorizontal: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoBannerText: {
    color: colors.gray400,
    fontSize: 13,
    lineHeight: 18,
  },
  proofGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  proofCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  proofCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  proofCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  proofCardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  proofCardDesc: {
    color: colors.gray500,
    fontSize: 12,
    lineHeight: 16,
  },
  proofCardCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateWrapper: {
    marginBottom: 24,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  generateText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  
  // Wallet Screen
  walletContent: {
    paddingHorizontal: 20,
  },
  mainBalanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  mainBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainBalanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mainBalanceAmount: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  mainBalanceUsd: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginBottom: 24,
  },
  mainBalanceActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  mainBalanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainBalanceBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  mainBalanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressLabel: {
    color: colors.gray500,
    fontSize: 12,
    marginBottom: 4,
  },
  addressValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addressBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 8,
  },
  statLabel: {
    color: colors.gray500,
    fontSize: 12,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  transactionAddress: {
    color: colors.gray500,
    fontSize: 12,
    marginTop: 2,
  },
  transactionValue: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  transactionTime: {
    color: colors.gray500,
    fontSize: 12,
    marginTop: 2,
  },
  
  // Settings Screen
  settingsContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInitials: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileAddress: {
    color: colors.gray500,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  profileBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  profileBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  settingsGroupTitle: {
    color: colors.gray500,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardAlt,
  },
  settingItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
  },
  settingItemValue: {
    color: colors.gray500,
    fontSize: 14,
    marginRight: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray600,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    color: colors.gray500,
    fontSize: 13,
    marginBottom: 4,
  },
  versionSubtext: {
    color: colors.gray600,
    fontSize: 12,
  },
});
