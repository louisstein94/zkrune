/**
 * zkRune Send Screen
 * Send SOL or zkRUNE tokens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, layout } from '../theme';
import { Card, GradientText, Button } from '../components/ui';
import { useWallet, useSolana, usePrice } from '../hooks';

type TokenType = 'SOL' | 'zkRUNE';

export function SendScreen({ navigation }: any) {
  const { connection, balance, zkRuneBalance, shortenAddress } = useWallet();
  const { sendTransaction, formatLamports } = useSolana();
  const { zkRunePrice, solPrice } = usePrice();

  const [selectedToken, setSelectedToken] = useState<TokenType>('zkRUNE');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const tokenBalance = selectedToken === 'SOL' ? balance : zkRuneBalance;
  const tokenPrice = selectedToken === 'SOL' ? solPrice : (zkRunePrice?.price || 0);
  const usdValue = parseFloat(amount || '0') * tokenPrice;

  const handleSend = async () => {
    if (!connection) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!recipientAddress.trim()) {
      Alert.alert('Error', 'Please enter a recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > tokenBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} ${selectedToken} to ${shortenAddress(recipientAddress)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsSending(true);
            try {
              // For native wallet, we would sign and send here
              // For external wallets (Phantom/Solflare), we would open deep link
              Alert.alert(
                'Transaction Submitted',
                `Sending ${amount} ${selectedToken}...\n\nNote: Full transaction signing will be available in the next update.`
              );
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Transaction failed');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  const handleMax = () => {
    // Leave some SOL for fees if sending SOL
    const maxAmount = selectedToken === 'SOL' 
      ? Math.max(0, tokenBalance - 0.01) 
      : tokenBalance;
    setAmount(maxAmount.toString());
  };

  const handlePaste = async () => {
    try {
      const Clipboard = await import('expo-clipboard');
      const text = await Clipboard.getStringAsync();
      if (text) {
        setRecipientAddress(text);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleScan = () => {
    navigation.navigate('ScanFull');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Send</GradientText>
          <View style={{ width: 24 }} />
        </View>

        {/* Token Selector */}
        <View style={styles.tokenSelector}>
          <TouchableOpacity
            style={[styles.tokenOption, selectedToken === 'zkRUNE' && styles.tokenOptionActive]}
            onPress={() => setSelectedToken('zkRUNE')}
          >
            <LinearGradient
              colors={selectedToken === 'zkRUNE' ? colors.brand.gradient : ['#1a1a24', '#1a1a24']}
              style={styles.tokenIcon}
            >
              <Text style={styles.runeSymbol}>ᚱ</Text>
            </LinearGradient>
            <Text style={[styles.tokenName, selectedToken === 'zkRUNE' && styles.tokenNameActive]}>
              zkRUNE
            </Text>
            <Text style={styles.tokenBalance}>{zkRuneBalance.toFixed(2)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tokenOption, selectedToken === 'SOL' && styles.tokenOptionActive]}
            onPress={() => setSelectedToken('SOL')}
          >
            <View style={[styles.tokenIcon, { backgroundColor: '#9945FF' }]}>
              <Text style={styles.solSymbol}>◎</Text>
            </View>
            <Text style={[styles.tokenName, selectedToken === 'SOL' && styles.tokenNameActive]}>
              SOL
            </Text>
            <Text style={styles.tokenBalance}>{balance.toFixed(4)}</Text>
          </TouchableOpacity>
        </View>

        {/* Recipient Address */}
        <Card style={styles.inputCard}>
          <Text style={styles.inputLabel}>Recipient Address</Text>
          <View style={styles.addressInputRow}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter Solana address..."
              placeholderTextColor={colors.text.tertiary}
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.addressBtn} onPress={handlePaste}>
              <Ionicons name="clipboard-outline" size={20} color={colors.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addressBtn} onPress={handleScan}>
              <Ionicons name="scan-outline" size={20} color={colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Amount Input */}
        <Card style={styles.inputCard}>
          <View style={styles.amountHeader}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TouchableOpacity onPress={handleMax}>
              <Text style={styles.maxBtn}>MAX</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.text.tertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.amountToken}>{selectedToken}</Text>
          </View>
          <Text style={styles.amountUsd}>
            ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </Text>
        </Card>

        {/* Summary */}
        {parseFloat(amount) > 0 && recipientAddress && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Network Fee</Text>
              <Text style={styles.summaryValue}>~0.000005 SOL</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryTotal}>
                {amount} {selectedToken}
              </Text>
            </View>
          </Card>
        )}

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isSending || !recipientAddress || !amount}
        >
          <LinearGradient
            colors={colors.brand.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendButtonGradient}
          >
            {isSending ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.text.primary} />
                <Text style={styles.sendButtonText}>Send {selectedToken}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  tokenSelector: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  tokenOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  tokenOptionActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary + '10',
  },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  runeSymbol: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  solSymbol: {
    fontSize: 20,
    color: colors.text.primary,
  },
  tokenName: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  tokenNameActive: {
    color: colors.text.primary,
  },
  tokenBalance: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  inputCard: {
    marginBottom: spacing[4],
  },
  inputLabel: {
    ...typography.styles.label,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  addressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  addressInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.radius.md,
    padding: spacing[4],
    color: colors.text.primary,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  addressBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  maxBtn: {
    ...typography.styles.label,
    color: colors.brand.primary,
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  amountToken: {
    ...typography.styles.h3,
    color: colors.text.secondary,
  },
  amountUsd: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  summaryCard: {
    marginBottom: spacing[6],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginVertical: spacing[3],
  },
  summaryTotal: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  sendButton: {
    borderRadius: layout.radius.lg,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
  },
  sendButtonText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
});
