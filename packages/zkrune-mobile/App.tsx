/**
 * zkRune Mobile - Ultra Premium Edition
 * Metallic gradients with glassmorphism
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// zkRune Color Palette - Mystical Metallic Theme
const colors = {
  // Deep mystical backgrounds
  bgDark: '#06080F',
  bgMid: '#0A0E18',
  bgLight: '#101624',
  
  // Metallic accent gradients with cyan/teal zkRune accent
  metalStart: '#0f1525',
  metalMid: '#151d32',
  metalEnd: '#121a2d',
  
  // Glass surfaces
  glass: 'rgba(20, 30, 50, 0.7)',
  glassBorder: 'rgba(100, 220, 255, 0.12)',
  glassHighlight: 'rgba(100, 220, 255, 0.05)',
  
  // zkRune brand gradient - Cyan/Teal mystical
  gradientStart: '#0EA5E9',
  gradientMid: '#06B6D4',
  gradientEnd: '#14B8A6',
  
  // Accent colors - zkRune teal/cyan theme
  primary: '#06B6D4',
  secondary: '#0EA5E9',
  accent: '#22D3EE',
  rune: '#5EEAD4', // Mystical rune glow
  
  // Status
  success: '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.2)',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Text
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
};

type IconName = keyof typeof Ionicons.glyphMap;

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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Full screen deep metallic gradient background */}
      <LinearGradient
        colors={['#050810', '#0a1020', '#0d1528', '#080e1a']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* zkRune mystical cyan glow overlay */}
      <LinearGradient
        colors={['rgba(6, 182, 212, 0.06)', 'transparent', 'rgba(14, 165, 233, 0.04)']}
        locations={[0, 0.5, 1]}
        style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
      />
      
      {renderScreen()}
      
      {/* Floating Bottom Navigation */}
      <View style={styles.navWrapper}>
        <View style={styles.navGlass}>
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

function NavItem({ icon, active, onPress }: { icon: string; active: boolean; onPress: () => void }) {
  const iconName = (active ? icon : `${icon}-outline`) as IconName;
  
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      {active ? (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.navActive}
        >
          <Ionicons name={iconName} size={22} color={colors.white} />
        </LinearGradient>
      ) : (
        <View style={styles.navInactive}>
          <Ionicons name={iconName} size={22} color={colors.gray500} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header with zkRune branding */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* zkRune Logo - Mystical Rune Symbol */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.avatar}
              >
                {/* Rune Symbol ᚱ */}
                <Text style={styles.runeSymbol}>ᚱ</Text>
              </LinearGradient>
              {/* Glow effect */}
              <View style={styles.logoGlow} />
            </View>
            <View>
              <Text style={styles.brandName}>zkRune</Text>
              <Text style={styles.brandTagline}>Privacy Layer</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="scan-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.gray400} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* zkRune Balance Card with Metallic Gradient */}
          <LinearGradient
            colors={['#0c1525', '#101d30', '#0e1828', '#0a1420']}
            locations={[0, 0.3, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* Metallic shine overlay */}
            <LinearGradient
              colors={['rgba(6,182,212,0.1)', 'transparent', 'rgba(6,182,212,0.03)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            {/* zkRune badge */}
            <View style={styles.zkBadge}>
              <Text style={styles.zkBadgeRune}>ᚱ</Text>
              <Text style={styles.zkBadgeText}>zkRUNE</Text>
            </View>
            
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>12,450.00</Text>
            <Text style={styles.balanceUsd}>≈ $1,245.00 USD</Text>
            <View style={styles.changeRow}>
              <View style={styles.changeBadge}>
                <Ionicons name="trending-up" size={12} color={colors.success} />
                <Text style={styles.changePercent}>+16.16%</Text>
              </View>
              <View style={styles.privacyBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.accent} />
                <Text style={styles.privacyText}>Private</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <ActionButton icon="arrow-up" label="Send" />
            <ActionButton icon="arrow-down" label="Receive" />
            <ActionButton icon="swap-horizontal" label="Swap" />
            <ActionButton icon="scan" label="Scan" />
            <ActionButton icon="time" label="History" />
            <ActionButton icon="ellipsis-horizontal" label="More" />
          </View>

          {/* Wallet Cards Horizontal Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.walletScroll}
            contentContainerStyle={styles.walletScrollContent}
          >
            <WalletCard 
              name="Wallet A" 
              address="0x3F..C21" 
              active 
            />
            <WalletCard 
              name="Wallet B" 
              address="0x7K..M45" 
              gradient={['#4C1D95', '#7C3AED']}
            />
            <TouchableOpacity style={styles.addWalletCard}>
              <Ionicons name="add" size={24} color={colors.gray500} />
            </TouchableOpacity>
          </ScrollView>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
              <Ionicons name="wallet" size={16} color={colors.white} />
              <Text style={styles.tabTextActive}>Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="swap-horizontal" size={16} color={colors.gray500} />
              <Text style={styles.tabText}>Exchange</Text>
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

          {/* zkRune Feature Cards */}
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
            />
            <FeatureCard 
              icon="flame"
              title="Burn"
              subtitle="Upgrade to Premium"
              desc="Burn zkRUNE tokens to unlock premium features and exclusive access."
            />
            <FeatureCard 
              icon="layers"
              title="Stake"
              subtitle="Earn 12% APY"
              desc="Stake your zkRUNE tokens and earn rewards while securing the network."
            />
          </ScrollView>

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ProofScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  
  const proofs = [
    { id: 'age', icon: 'person' as IconName, title: 'Age Verification', desc: 'Prove you are above a threshold' },
    { id: 'balance', icon: 'wallet' as IconName, title: 'Balance Proof', desc: 'Prove minimum token balance' },
    { id: 'member', icon: 'people' as IconName, title: 'Membership', desc: 'Prove group membership' },
    { id: 'credential', icon: 'ribbon' as IconName, title: 'Credential', desc: 'Prove certification status' },
    { id: 'vote', icon: 'checkbox' as IconName, title: 'Private Voting', desc: 'Anonymous governance votes' },
    { id: 'reputation', icon: 'star' as IconName, title: 'Reputation', desc: 'Anonymous reputation score' },
  ];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Generate Proof</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="information-circle-outline" size={24} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.proofContent}
        >
          {/* Info Banner with Glass effect */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.08)', 'rgba(139, 92, 246, 0.05)']}
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
                  colors={selected === proof.id 
                    ? [colors.gradientStart, colors.gradientEnd] 
                    : ['#2a3352', '#1e2540']
                  }
                  style={styles.proofCardIcon}
                >
                  <Ionicons name={proof.icon} size={20} color={colors.white} />
                </LinearGradient>
                <Text style={styles.proofCardTitle}>{proof.title}</Text>
                <Text style={styles.proofCardDesc}>{proof.desc}</Text>
                {selected === proof.id && (
                  <View style={styles.proofCardCheck}>
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          {selected && (
            <TouchableOpacity activeOpacity={0.8} style={styles.generateWrapper}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtn}
              >
                <Ionicons name="flash" size={20} color={colors.white} />
                <Text style={styles.generateText}>Generate Proof</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 140 }} />
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
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="qr-code-outline" size={22} color={colors.gray400} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.walletContent}
        >
          {/* Main Balance Card with Metallic Gradient */}
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainBalanceCard}
          >
            {/* Metallic shine */}
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'transparent', 'rgba(255,255,255,0.05)']}
              locations={[0, 0.3, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
            />
            
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
          <View style={styles.glassCard}>
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

          {/* Transactions */}
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          <View style={styles.transactionsList}>
            <TransactionItem 
              type="receive"
              title="Received zkRUNE"
              address="From: 3mPq...7nRt"
              amount="+500.00"
              time="2h ago"
            />
            <TransactionItem 
              type="send"
              title="Sent zkRUNE"
              address="To: 9xYz...4kLm"
              amount="-120.00"
              time="5h ago"
            />
            <TransactionItem 
              type="stake"
              title="Staked zkRUNE"
              address="Lock: 30 days"
              amount="-1,000.00"
              time="1d ago"
            />
          </View>

          <View style={{ height: 140 }} />
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
          <View style={styles.profileCard}>
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
          </View>

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
          </View>

          {/* Version with Rune */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionRune}>ᚱ</Text>
            <Text style={styles.versionText}>zkRune Mobile v0.1.0</Text>
            <Text style={styles.versionSubtext}>Zero-Knowledge Privacy on Solana</Text>
          </View>

          <View style={{ height: 140 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Component Helpers
function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
      <View style={styles.actionButtonIcon}>
        <Ionicons name={icon as IconName} size={18} color={colors.white} />
      </View>
      <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function WalletCard({ name, address, active, gradient }: { 
  name: string; 
  address: string; 
  active?: boolean; 
  gradient?: string[];
}) {
  const cardGradient = gradient || (active 
    ? ['#1e2845', '#2a3455', '#252d48'] 
    : ['#181f35', '#1a2238', '#151c30']
  );
  
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.walletCard, active && styles.walletCardActive]}
      >
        {/* Metallic shine */}
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

function FeatureCard({ icon, title, subtitle, desc }: { 
  icon: string; 
  title: string; 
  subtitle: string;
  desc: string;
}) {
  return (
    <View style={styles.featureCard}>
      {/* Metallic gradient background */}
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
        <TouchableOpacity style={styles.featureCardArrow}>
          <Ionicons name="arrow-forward" size={16} color={colors.gray400} />
        </TouchableOpacity>
      </View>
      <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
      <Text style={styles.featureCardDesc}>{desc}</Text>
    </View>
  );
}

function TransactionItem({ type, title, address, amount, time }: {
  type: string;
  title: string;
  address: string;
  amount: string;
  time: string;
}) {
  const getIcon = (): IconName => {
    switch(type) {
      case 'receive': return 'arrow-down';
      case 'send': return 'arrow-up';
      case 'stake': return 'layers';
      default: return 'swap-horizontal';
    }
  };
  
  const getColor = () => {
    switch(type) {
      case 'receive': return colors.success;
      case 'send': return colors.error;
      case 'stake': return colors.primary;
      default: return colors.gray500;
    }
  };

  const isPositive = amount.startsWith('+');

  return (
    <View style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: getColor() + '15' }]}>
        <Ionicons name={getIcon()} size={16} color={getColor()} />
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
    </View>
  );
}

function SettingItem({ icon, title, value, hasToggle, isOn }: {
  icon: string;
  title: string;
  value?: string;
  hasToggle?: boolean;
  isOn?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
      <View style={styles.settingItemIcon}>
        <Ionicons name={icon as IconName} size={18} color={colors.primary} />
      </View>
      <Text style={styles.settingItemTitle}>{title}</Text>
      {value && <Text style={styles.settingItemValue}>{value}</Text>}
      {hasToggle && (
        <View style={[styles.toggle, isOn && styles.toggleOn]}>
          <View style={[styles.toggleThumb, isOn && styles.toggleThumbOn]} />
        </View>
      )}
      {!hasToggle && <Ionicons name="chevron-forward" size={18} color={colors.gray600} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  screen: {
    flex: 1,
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
    borderColor: 'rgba(139, 92, 246, 0.4)',
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
  
  // Section
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  
  // Glass Card
  glassCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  
  // Navigation
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 28,
    paddingHorizontal: 50,
  },
  navGlass: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 16, 30, 0.95)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navActive: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navInactive: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Screen Header
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
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
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  proofCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  proofCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    borderRadius: 18,
    gap: 10,
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  mainBalanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainBalanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mainBalanceAmount: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  mainBalanceUsd: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    marginBottom: 24,
  },
  mainBalanceActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    gap: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  transactionIcon: {
    width: 42,
    height: 42,
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
    fontWeight: '600',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  profileBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  settingsGroupTitle: {
    color: colors.gray500,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingItemTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
  },
  settingItemValue: {
    color: colors.gray500,
    fontSize: 14,
    marginRight: 10,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  versionRune: {
    color: colors.primary,
    fontSize: 28,
    marginBottom: 8,
    opacity: 0.6,
  },
  versionText: {
    color: colors.gray400,
    fontSize: 13,
    marginBottom: 4,
  },
  versionSubtext: {
    color: colors.gray600,
    fontSize: 12,
  },
});
