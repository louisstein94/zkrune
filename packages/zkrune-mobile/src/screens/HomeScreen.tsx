/**
 * zkRune Home Screen
 * Main dashboard with wallet overview and quick actions
 */

import React from 'react';
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

export function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <GradientText style={styles.title}>zkRune</GradientText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={colors.brand.gradient}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={20} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <LinearGradient
          colors={['#1a1a2e', '#16162a']}
          style={styles.walletCard}
        >
          <View style={styles.walletHeader}>
            <Text style={styles.walletLabel}>Total Balance</Text>
            <TouchableOpacity>
              <Ionicons name="eye-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.walletBalance}>12,450.00</Text>
          <Text style={styles.walletToken}>zkRUNE</Text>
          
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.walletAction}>
              <View style={styles.walletActionIcon}>
                <Ionicons name="arrow-up" size={18} color={colors.brand.primary} />
              </View>
              <Text style={styles.walletActionText}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.walletAction}>
              <View style={styles.walletActionIcon}>
                <Ionicons name="arrow-down" size={18} color={colors.accent.emerald} />
              </View>
              <Text style={styles.walletActionText}>Receive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.walletAction}>
              <View style={styles.walletActionIcon}>
                <Ionicons name="swap-horizontal" size={18} color={colors.accent.cyan} />
              </View>
              <Text style={styles.walletActionText}>Swap</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Proof')}
          >
            <LinearGradient
              colors={[colors.brand.primary + '20', 'transparent']}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="shield-checkmark" size={28} color={colors.brand.primary} />
              </View>
              <Text style={styles.actionTitle}>Generate Proof</Text>
              <Text style={styles.actionDescription}>Create ZK proof</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={[colors.accent.emerald + '20', 'transparent']}
              style={styles.actionGradient}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.accent.emerald + '20' }]}>
                <Ionicons name="checkmark-circle" size={28} color={colors.accent.emerald} />
              </View>
              <Text style={styles.actionTitle}>Verify Proof</Text>
              <Text style={styles.actionDescription}>Scan & verify</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={[colors.accent.pink + '20', 'transparent']}
              style={styles.actionGradient}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.accent.pink + '20' }]}>
                <Ionicons name="layers" size={28} color={colors.accent.pink} />
              </View>
              <Text style={styles.actionTitle}>Templates</Text>
              <Text style={styles.actionDescription}>Browse circuits</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={[colors.accent.amber + '20', 'transparent']}
              style={styles.actionGradient}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.accent.amber + '20' }]}>
                <Ionicons name="flame" size={28} color={colors.accent.amber} />
              </View>
              <Text style={styles.actionTitle}>Staking</Text>
              <Text style={styles.actionDescription}>Earn rewards</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <Card style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: colors.status.success + '20' }]}>
              <Ionicons name="checkmark" size={16} color={colors.status.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Age Verification Proof</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
            <Text style={styles.activityStatus}>Verified</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: colors.brand.primary + '20' }]}>
              <Ionicons name="flash" size={16} color={colors.brand.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Balance Proof Generated</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
            <Text style={styles.activityStatus}>Success</Text>
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
  greeting: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCard: {
    borderRadius: layout.radius.xl,
    padding: spacing[6],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  walletLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
  },
  walletBalance: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  walletToken: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[6],
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  walletAction: {
    alignItems: 'center',
  },
  walletActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  walletActionText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[4],
  },
  actionCard: {
    flex: 1,
    borderRadius: layout.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  actionGradient: {
    padding: spacing[4],
    minHeight: 140,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  actionTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  actionDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  activityCard: {
    padding: spacing[4],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  activityTime: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  activityStatus: {
    ...typography.styles.bodySmall,
    color: colors.status.success,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing[3],
  },
});
