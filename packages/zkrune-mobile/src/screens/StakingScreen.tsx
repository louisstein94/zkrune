/**
 * zkRune Staking Screen
 * Stake zkRUNE tokens and earn rewards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card, GradientText } from '../components/ui';
import { useWallet } from '../hooks';
import { STAKING_CONFIG } from '../services/solanaRpc';

interface StakePosition {
  id: string;
  amount: number;
  lockPeriod: number;
  startDate: Date;
  endDate: Date;
  rewards: number;
  apy: number;
}

// Demo staking positions
const demoPositions: StakePosition[] = [
  {
    id: '1',
    amount: 1000,
    lockPeriod: 90,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    rewards: 45.5,
    apy: 18,
  },
  {
    id: '2',
    amount: 500,
    lockPeriod: 30,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    rewards: 8.2,
    apy: 12,
  },
];

export function StakingScreen({ navigation }: any) {
  const { isConnected, zkRuneBalance } = useWallet();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [positions] = useState<StakePosition[]>(demoPositions);

  const selectedConfig = STAKING_CONFIG.LOCK_PERIODS.find(p => p.days === selectedPeriod);
  const calculatedAPY = STAKING_CONFIG.BASE_APY * (selectedConfig?.multiplier || 1);
  const estimatedRewards = stakeAmount 
    ? (parseFloat(stakeAmount) * (calculatedAPY / 100) * (selectedPeriod / 365))
    : 0;

  const totalStaked = positions.reduce((sum, p) => sum + p.amount, 0);
  const totalRewards = positions.reduce((sum, p) => sum + p.rewards, 0);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) < STAKING_CONFIG.MIN_STAKE) {
      Alert.alert('Invalid Amount', `Minimum stake is ${STAKING_CONFIG.MIN_STAKE} zkRUNE`);
      return;
    }

    if (parseFloat(stakeAmount) > zkRuneBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough zkRUNE tokens');
      return;
    }

    setIsStaking(true);
    
    // Simulate staking transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Alert.alert(
      'Staking Successful!',
      `You've staked ${stakeAmount} zkRUNE for ${selectedPeriod} days at ${calculatedAPY}% APY`,
      [{ text: 'OK', onPress: () => setStakeAmount('') }]
    );
    
    setIsStaking(false);
  };

  const handleUnstake = (position: StakePosition) => {
    const now = new Date();
    if (now < position.endDate) {
      Alert.alert(
        'Early Unstake',
        `Unstaking early will forfeit ${(position.rewards * 0.5).toFixed(2)} zkRUNE in rewards. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unstake', style: 'destructive', onPress: () => {} },
        ]
      );
    } else {
      Alert.alert(
        'Unstake',
        `Claim ${position.amount + position.rewards} zkRUNE?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Claim', onPress: () => {} },
        ]
      );
    }
  };

  const handleMaxAmount = () => {
    setStakeAmount(zkRuneBalance.toString());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Staking</GradientText>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={[colors.brand.primary, colors.accent.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Staked</Text>
              <Text style={styles.statValue}>{totalStaked.toLocaleString()}</Text>
              <Text style={styles.statUnit}>zkRUNE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rewards Earned</Text>
              <Text style={styles.statValue}>{totalRewards.toFixed(2)}</Text>
              <Text style={styles.statUnit}>zkRUNE</Text>
            </View>
          </View>
          
          <View style={styles.apyBadge}>
            <Ionicons name="trending-up" size={16} color={colors.status.success} />
            <Text style={styles.apyText}>Up to {STAKING_CONFIG.MAX_APY}% APY</Text>
          </View>
        </LinearGradient>

        {/* Stake New */}
        <Text style={styles.sectionTitle}>Stake zkRUNE</Text>
        
        <Card style={styles.stakeCard}>
          {/* Lock Period Selection */}
          <Text style={styles.inputLabel}>Lock Period</Text>
          <View style={styles.periodOptions}>
            {STAKING_CONFIG.LOCK_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.days}
                style={[
                  styles.periodOption,
                  selectedPeriod === period.days && styles.periodOptionSelected,
                ]}
                onPress={() => setSelectedPeriod(period.days)}
              >
                <Text style={[
                  styles.periodDays,
                  selectedPeriod === period.days && styles.periodTextSelected,
                ]}>
                  {period.days}d
                </Text>
                <Text style={[
                  styles.periodApy,
                  selectedPeriod === period.days && styles.periodTextSelected,
                ]}>
                  {(STAKING_CONFIG.BASE_APY * period.multiplier).toFixed(0)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={stakeAmount}
              onChangeText={setStakeAmount}
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
            <Text style={styles.tokenSymbol}>zkRUNE</Text>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available:</Text>
            <Text style={styles.balanceValue}>{zkRuneBalance.toLocaleString()} zkRUNE</Text>
          </View>

          {/* Estimated Rewards */}
          {parseFloat(stakeAmount) > 0 && (
            <View style={styles.estimateCard}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Lock Period</Text>
                <Text style={styles.estimateValue}>{selectedConfig?.name}</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>APY</Text>
                <Text style={[styles.estimateValue, { color: colors.status.success }]}>
                  {calculatedAPY.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Est. Rewards</Text>
                <Text style={[styles.estimateValue, { color: colors.brand.primary }]}>
                  +{estimatedRewards.toFixed(2)} zkRUNE
                </Text>
              </View>
            </View>
          )}

          <Button
            title={isStaking ? 'Staking...' : 'Stake Now'}
            onPress={handleStake}
            loading={isStaking}
            disabled={!isConnected || !stakeAmount || parseFloat(stakeAmount) < STAKING_CONFIG.MIN_STAKE}
            size="lg"
            style={styles.stakeButton}
          />
        </Card>

        {/* Active Positions */}
        {positions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Your Positions</Text>
            
            {positions.map((position) => {
              const now = new Date();
              const progress = Math.min(
                ((now.getTime() - position.startDate.getTime()) /
                (position.endDate.getTime() - position.startDate.getTime())) * 100,
                100
              );
              const isComplete = now >= position.endDate;

              return (
                <Card key={position.id} style={styles.positionCard}>
                  <View style={styles.positionHeader}>
                    <View>
                      <Text style={styles.positionAmount}>
                        {position.amount.toLocaleString()} zkRUNE
                      </Text>
                      <Text style={styles.positionPeriod}>
                        {position.lockPeriod} days @ {position.apy}% APY
                      </Text>
                    </View>
                    <View style={[
                      styles.positionStatus,
                      isComplete && styles.positionStatusComplete,
                    ]}>
                      <Text style={[
                        styles.positionStatusText,
                        isComplete && styles.positionStatusTextComplete,
                      ]}>
                        {isComplete ? 'Ready' : 'Locked'}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${progress}%` },
                          isComplete && { backgroundColor: colors.status.success },
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {isComplete ? 'Complete' : `${Math.floor(progress)}%`}
                    </Text>
                  </View>

                  <View style={styles.positionFooter}>
                    <View>
                      <Text style={styles.rewardsLabel}>Rewards Earned</Text>
                      <Text style={styles.rewardsValue}>
                        +{position.rewards.toFixed(2)} zkRUNE
                      </Text>
                    </View>
                    <Button
                      title={isComplete ? 'Claim' : 'Unstake'}
                      onPress={() => handleUnstake(position)}
                      variant={isComplete ? 'primary' : 'secondary'}
                      size="sm"
                    />
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {/* Info Section */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={colors.brand.primary} />
            <Text style={styles.infoTitle}>How Staking Works</Text>
          </View>
          <Text style={styles.infoText}>
            Lock your zkRUNE tokens to earn rewards. Longer lock periods offer higher APY. 
            Early unstaking may result in reduced rewards.
          </Text>
          
          <View style={styles.infoList}>
            <View style={styles.infoListItem}>
              <Ionicons name="checkmark" size={16} color={colors.status.success} />
              <Text style={styles.infoListText}>Minimum stake: {STAKING_CONFIG.MIN_STAKE} zkRUNE</Text>
            </View>
            <View style={styles.infoListItem}>
              <Ionicons name="checkmark" size={16} color={colors.status.success} />
              <Text style={styles.infoListText}>Rewards compound automatically</Text>
            </View>
            <View style={styles.infoListItem}>
              <Ionicons name="checkmark" size={16} color={colors.status.success} />
              <Text style={styles.infoListText}>No gas fees for claiming</Text>
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
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    borderRadius: 24,
    padding: spacing[6],
    marginBottom: spacing[6],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.styles.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statUnit: {
    ...typography.styles.bodySmall,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  apyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: spacing[2],
    borderRadius: 12,
  },
  apyText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  stakeCard: {
    marginBottom: spacing[6],
  },
  inputLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  periodOptions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  periodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodOptionSelected: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + '15',
  },
  periodDays: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  periodApy: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  periodTextSelected: {
    color: colors.brand.primary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.input.radius,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  amountInput: {
    flex: 1,
    height: layout.input.height,
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  maxButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.brand.primary + '20',
    borderRadius: 8,
    marginRight: spacing[2],
  },
  maxButtonText: {
    ...typography.styles.bodySmall,
    color: colors.brand.primary,
    fontWeight: '700',
  },
  tokenSymbol: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  balanceLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  balanceValue: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  estimateCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  estimateLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  estimateValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  stakeButton: {
    marginTop: spacing[2],
  },
  positionCard: {
    marginBottom: spacing[3],
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  positionAmount: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  positionPeriod: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  positionStatus: {
    backgroundColor: colors.status.warning + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 8,
  },
  positionStatusComplete: {
    backgroundColor: colors.status.success + '20',
  },
  positionStatusText: {
    ...typography.styles.bodySmall,
    color: colors.status.warning,
    fontWeight: '600',
  },
  positionStatusTextComplete: {
    color: colors.status.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    width: 60,
    textAlign: 'right',
  },
  positionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  rewardsValue: {
    ...typography.styles.body,
    color: colors.status.success,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.brand.primary + '10',
    borderColor: colors.brand.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  infoTitle: {
    ...typography.styles.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  infoText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  infoList: {
    gap: spacing[2],
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  infoListText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
});

export default StakingScreen;
