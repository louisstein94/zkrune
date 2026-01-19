/**
 * zkRune Token Swap Screen
 * Swap tokens via Jupiter/Raydium
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

interface Token {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logo: string;
  balance: number;
  price: number;
}

const POPULAR_TOKENS: Token[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logo: '◎',
    balance: 0,
    price: 150.0,
  },
  {
    symbol: 'zkRUNE',
    name: 'zkRune Token',
    mint: '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump',
    decimals: 6,
    logo: 'ᚱ',
    balance: 0,
    price: 0.10,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logo: '$',
    balance: 0,
    price: 1.0,
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logo: '🐕',
    balance: 0,
    price: 0.00002,
  },
];

export function SwapScreen({ navigation }: any) {
  const { isConnected, balance, zkRuneBalance } = useWallet();
  
  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showTokenPicker, setShowTokenPicker] = useState<'from' | 'to' | null>(null);
  const [slippage, setSlippage] = useState(0.5);

  // Update balances based on wallet
  const tokensWithBalances = POPULAR_TOKENS.map(token => ({
    ...token,
    balance: token.symbol === 'SOL' ? balance : 
             token.symbol === 'zkRUNE' ? zkRuneBalance : 
             0,
  }));

  // Calculate output amount
  const fromAmountNum = parseFloat(fromAmount) || 0;
  const exchangeRate = fromToken.price / toToken.price;
  const toAmount = fromAmountNum * exchangeRate;
  const priceImpact = fromAmountNum > 1000 ? 0.5 : 0.1; // Demo price impact
  const minimumReceived = toAmount * (1 - slippage / 100);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
  };

  const handleSelectToken = (token: Token) => {
    if (showTokenPicker === 'from') {
      if (token.mint === toToken.mint) {
        handleSwapTokens();
      } else {
        setFromToken(token);
      }
    } else {
      if (token.mint === fromToken.mint) {
        handleSwapTokens();
      } else {
        setToToken(token);
      }
    }
    setShowTokenPicker(null);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      Alert.alert('Connect Wallet', 'Please connect your wallet to swap tokens');
      return;
    }

    if (!fromAmount || fromAmountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setIsSwapping(true);
    
    // Simulate swap (in production, call Jupiter API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Alert.alert(
      'Swap Successful!',
      `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount.toFixed(4)} ${toToken.symbol}`,
      [{ text: 'OK', onPress: () => setFromAmount('') }]
    );
    
    setIsSwapping(false);
  };

  const handleMaxAmount = () => {
    const maxBalance = fromToken.symbol === 'SOL' ? balance : 
                       fromToken.symbol === 'zkRUNE' ? zkRuneBalance : 0;
    setFromAmount(maxBalance.toString());
  };

  // Token picker modal
  if (showTokenPicker) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setShowTokenPicker(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>
            Select {showTokenPicker === 'from' ? 'From' : 'To'} Token
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.tokenList}>
          {tokensWithBalances.map((token) => (
            <TouchableOpacity
              key={token.mint}
              style={styles.tokenItem}
              onPress={() => handleSelectToken(token)}
            >
              <View style={styles.tokenLogo}>
                <Text style={styles.tokenLogoText}>{token.logo}</Text>
              </View>
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                <Text style={styles.tokenName}>{token.name}</Text>
              </View>
              <View style={styles.tokenBalance}>
                <Text style={styles.tokenBalanceValue}>
                  {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </Text>
                <Text style={styles.tokenBalanceLabel}>Balance</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <GradientText style={styles.title}>Swap</GradientText>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Swap Card */}
        <Card style={styles.swapCard}>
          {/* From Token */}
          <View style={styles.tokenSection}>
            <Text style={styles.sectionLabel}>From</Text>
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowTokenPicker('from')}
            >
              <View style={styles.tokenLogo}>
                <Text style={styles.tokenLogoText}>{fromToken.logo}</Text>
              </View>
              <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={fromAmount}
                onChangeText={setFromAmount}
                placeholder="0.00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>
                Balance: {(fromToken.symbol === 'SOL' ? balance : 
                          fromToken.symbol === 'zkRUNE' ? zkRuneBalance : 0).toLocaleString()} {fromToken.symbol}
              </Text>
              <Text style={styles.usdValue}>
                ≈ ${(fromAmountNum * fromToken.price).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapArrowButton} onPress={handleSwapTokens}>
            <LinearGradient
              colors={[colors.background.tertiary, colors.background.secondary]}
              style={styles.swapArrow}
            >
              <Ionicons name="swap-vertical" size={20} color={colors.brand.primary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* To Token */}
          <View style={styles.tokenSection}>
            <Text style={styles.sectionLabel}>To</Text>
            <TouchableOpacity 
              style={styles.tokenSelector}
              onPress={() => setShowTokenPicker('to')}
            >
              <View style={styles.tokenLogo}>
                <Text style={styles.tokenLogoText}>{toToken.logo}</Text>
              </View>
              <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.amountContainer}>
              <Text style={styles.outputAmount}>
                {toAmount > 0 ? toAmount.toFixed(6) : '0.00'}
              </Text>
            </View>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>
                Balance: {(toToken.symbol === 'SOL' ? balance : 
                          toToken.symbol === 'zkRUNE' ? zkRuneBalance : 0).toLocaleString()} {toToken.symbol}
              </Text>
              <Text style={styles.usdValue}>
                ≈ ${(toAmount * toToken.price).toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Swap Details */}
        {fromAmountNum > 0 && (
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate</Text>
              <Text style={styles.detailValue}>
                1 {fromToken.symbol} = {exchangeRate.toFixed(4)} {toToken.symbol}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price Impact</Text>
              <Text style={[
                styles.detailValue,
                priceImpact > 1 && { color: colors.status.warning },
                priceImpact > 5 && { color: colors.status.error },
              ]}>
                {priceImpact.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slippage</Text>
              <View style={styles.slippageOptions}>
                {[0.5, 1.0, 2.0].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.slippageOption,
                      slippage === value && styles.slippageOptionActive,
                    ]}
                    onPress={() => setSlippage(value)}
                  >
                    <Text style={[
                      styles.slippageText,
                      slippage === value && styles.slippageTextActive,
                    ]}>
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Min. Received</Text>
              <Text style={styles.detailValue}>
                {minimumReceived.toFixed(4)} {toToken.symbol}
              </Text>
            </View>
          </Card>
        )}

        {/* Swap Button */}
        <Button
          title={isSwapping ? 'Swapping...' : 'Swap'}
          onPress={handleSwap}
          loading={isSwapping}
          disabled={!isConnected || !fromAmount || fromAmountNum <= 0}
          size="lg"
          style={styles.swapButton}
        />

        {/* Powered by */}
        <View style={styles.poweredBy}>
          <Text style={styles.poweredByText}>Powered by Jupiter Aggregator</Text>
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
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapCard: {
    marginBottom: spacing[4],
    position: 'relative',
  },
  tokenSection: {
    paddingVertical: spacing[4],
  },
  sectionLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing[2],
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing[3],
    borderRadius: 12,
    gap: spacing[2],
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
  },
  tokenLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLogoText: {
    fontSize: 16,
    color: colors.brand.primary,
  },
  tokenSymbol: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  outputAmount: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  maxButton: {
    backgroundColor: colors.brand.primary + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  maxButtonText: {
    ...typography.styles.bodySmall,
    color: colors.brand.primary,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  usdValue: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  swapArrowButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 10,
  },
  swapArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  detailsCard: {
    marginBottom: spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  detailLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  slippageOptions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  slippageOption: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.background.tertiary,
    borderRadius: 8,
  },
  slippageOptionActive: {
    backgroundColor: colors.brand.primary + '20',
  },
  slippageText: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  slippageTextActive: {
    color: colors.brand.primary,
    fontWeight: '600',
  },
  swapButton: {
    marginTop: spacing[2],
  },
  poweredBy: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  poweredByText: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  // Token picker styles
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  pickerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
  },
  tokenList: {
    flex: 1,
    padding: spacing[4],
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    marginBottom: spacing[2],
  },
  tokenInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  tokenName: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenBalanceValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tokenBalanceLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
});

export default SwapScreen;
