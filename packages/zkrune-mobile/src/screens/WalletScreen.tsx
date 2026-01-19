/**
 * zkRune Wallet Screen
 * Native wallet creation, import, and external wallet connection
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, spacing, layout } from '../theme';
import { Button, Card, GradientText } from '../components/ui';
import { useWallet, useSolana } from '../hooks';
import { WalletProvider, WalletType, walletService } from '../services';

export function WalletScreen({ navigation }: any) {
  const {
    connection,
    isConnected,
    isConnecting,
    balance,
    zkRuneBalance,
    availableWallets,
    connect,
    disconnect,
    refreshBalance,
    shortenAddress,
    getProviderName,
    createNativeWallet,
    importFromSeedPhrase,
  } = useWallet();

  const {
    isHealthy,
    network,
    getNetworkName,
    getRecentTransactions,
    formatLamports,
  } = useSolana();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // Modal states for wallet creation/import
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [importSeedPhrase, setImportSeedPhrase] = useState('');
  const [walletName, setWalletName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showWatchOnlyModal, setShowWatchOnlyModal] = useState(false);
  const [watchOnlyAddress, setWatchOnlyAddress] = useState('');

  // Load transactions when connected
  useEffect(() => {
    if (connection) {
      loadTransactions();
    }
  }, [connection]);

  const loadTransactions = async () => {
    if (!connection) return;
    
    try {
      const txs = await getRecentTransactions(connection.publicKey, 5);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    await loadTransactions();
    setIsRefreshing(false);
  };

  const handleConnect = async (provider: WalletProvider) => {
    const success = await connect(provider);
    if (!success) {
      Alert.alert(
        'Wallet Not Found',
        `${getProviderName(provider)} is not installed. Would you like to download it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: () => {} },
        ]
      );
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnect },
      ]
    );
  };

  const handleCopyAddress = async () => {
    if (!connection) return;
    await Clipboard.setStringAsync(connection.publicKey);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  // Handle native wallet creation
  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const result = await createNativeWallet(walletName || 'My Wallet');
      if (result) {
        setSeedPhrase(result.mnemonic);
        setShowCreateModal(false);
        setShowSeedPhraseModal(true);
      } else {
        Alert.alert('Error', 'Failed to create wallet. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle seed phrase import
  const handleImportWallet = async () => {
    if (!importSeedPhrase.trim()) {
      Alert.alert('Error', 'Please enter your seed phrase');
      return;
    }

    setIsCreating(true);
    try {
      const wallet = await importFromSeedPhrase(
        importSeedPhrase.trim(),
        walletName || 'Imported Wallet'
      );
      if (wallet) {
        setShowImportModal(false);
        setImportSeedPhrase('');
        setWalletName('');
        Alert.alert('Success', 'Wallet imported successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import wallet');
    } finally {
      setIsCreating(false);
    }
  };

  // Copy seed phrase
  const handleCopySeedPhrase = async () => {
    await Clipboard.setStringAsync(seedPhrase);
    Alert.alert('Copied', 'Seed phrase copied to clipboard. Store it safely!');
  };

  // Close seed phrase modal
  const handleSeedPhraseAcknowledged = () => {
    setShowSeedPhraseModal(false);
    setSeedPhrase('');
    Alert.alert('Important', 'Make sure you have saved your seed phrase securely. You will need it to recover your wallet.');
  };

  // Handle watch only wallet
  const handleAddWatchOnly = async () => {
    if (!watchOnlyAddress.trim()) {
      Alert.alert('Error', 'Please enter a wallet address');
      return;
    }

    setIsCreating(true);
    try {
      const result = await walletService.addWatchOnlyWallet(
        watchOnlyAddress.trim(),
        walletName || 'Watch Only'
      );
      if (result) {
        setShowWatchOnlyModal(false);
        setWatchOnlyAddress('');
        setWalletName('');
        Alert.alert('Success', 'Watch-only wallet added! Please refresh the app.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid address');
    } finally {
      setIsCreating(false);
    }
  };

  // Get wallet type display name
  const getWalletTypeName = () => {
    if (!connection) return '';
    switch (connection.walletType) {
      case WalletType.NATIVE:
        return 'zkRune Wallet';
      case WalletType.IMPORTED:
        return 'Imported';
      case WalletType.EXTERNAL:
        return getProviderName(connection.provider);
      case WalletType.WATCH_ONLY:
        return 'Watch Only';
      default:
        return connection.name || 'Wallet';
    }
  };

  // Not connected view (also show if seed phrase modal is open)
  if (!isConnected || showSeedPhraseModal || showCreateModal || showImportModal) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <GradientText style={styles.title}>Wallet</GradientText>
          </View>

          {/* Connect Wallet Card */}
          <LinearGradient
            colors={[colors.brand.primary + '15', 'transparent']}
            style={styles.connectCard}
          >
            <View style={styles.connectIcon}>
              <Ionicons name="wallet-outline" size={48} color={colors.brand.primary} />
            </View>
            <Text style={styles.connectTitle}>Connect Your Wallet</Text>
            <Text style={styles.connectDescription}>
              Connect your Solana wallet to view balances, generate proofs, and interact with zkRune
            </Text>
          </LinearGradient>

          {/* Create New Wallet Option */}
          <Text style={styles.sectionTitle}>Create New Wallet</Text>

          <TouchableOpacity
            style={styles.walletOption}
            onPress={() => setShowCreateModal(true)}
            disabled={isConnecting}
          >
            <View style={[styles.walletIcon, { backgroundColor: colors.brand.primary + '20' }]}>
              <Ionicons name="add-circle" size={24} color={colors.brand.primary} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Create New Wallet</Text>
              <Text style={styles.walletDescription}>
                Generate a new Solana wallet
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.walletOption}
            onPress={() => setShowImportModal(true)}
            disabled={isConnecting}
          >
            <View style={[styles.walletIcon, { backgroundColor: colors.accent.emerald + '20' }]}>
              <Ionicons name="download" size={24} color={colors.accent.emerald} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Import Wallet</Text>
              <Text style={styles.walletDescription}>
                Use seed phrase or private key
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* External Wallet Options */}
          <Text style={styles.sectionTitle}>Connect External Wallet</Text>

          <TouchableOpacity
            style={styles.walletOption}
            onPress={() => handleConnect(WalletProvider.PHANTOM)}
            disabled={isConnecting}
          >
            <View style={[styles.walletIcon, { backgroundColor: '#AB9FF2' + '20' }]}>
              <Ionicons name="wallet" size={24} color="#AB9FF2" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Phantom</Text>
              <Text style={styles.walletDescription}>
                {availableWallets.includes(WalletProvider.PHANTOM) 
                  ? 'Installed' 
                  : 'Tap to install'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.walletOption}
            onPress={() => handleConnect(WalletProvider.SOLFLARE)}
            disabled={isConnecting}
          >
            <View style={[styles.walletIcon, { backgroundColor: '#FC8E0E' + '20' }]}>
              <Ionicons name="sunny" size={24} color="#FC8E0E" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Solflare</Text>
              <Text style={styles.walletDescription}>
                {availableWallets.includes(WalletProvider.SOLFLARE) 
                  ? 'Installed' 
                  : 'Tap to install'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* Watch Only Option */}
          <Text style={styles.sectionTitle}>Watch Only</Text>
          
          <TouchableOpacity
            style={styles.walletOption}
            onPress={() => setShowWatchOnlyModal(true)}
            disabled={isConnecting}
          >
            <View style={[styles.walletIcon, { backgroundColor: colors.text.tertiary + '20' }]}>
              <Ionicons name="eye" size={24} color={colors.text.tertiary} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletName}>Watch Only</Text>
              <Text style={styles.walletDescription}>
                View any wallet without private key
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          {isConnecting && (
            <View style={styles.connectingState}>
              <Text style={styles.connectingText}>Connecting to wallet...</Text>
              <Text style={styles.connectingSubtext}>
                Please approve the connection in your wallet app
              </Text>
            </View>
          )}

          {/* Network Status */}
          <Card style={styles.networkCard}>
            <View style={styles.networkRow}>
              <View style={[styles.networkDot, isHealthy && styles.networkDotHealthy]} />
              <Text style={styles.networkLabel}>Network</Text>
              <Text style={styles.networkValue}>{getNetworkName(network)}</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Create Wallet Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Wallet</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Create a new Solana wallet. You'll receive a 12-word seed phrase that you must store securely.
              </Text>

              <Text style={styles.inputLabel}>Wallet Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="My Wallet"
                placeholderTextColor={colors.text.tertiary}
                value={walletName}
                onChangeText={setWalletName}
              />

              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={colors.status.warning} />
                <Text style={styles.warningText}>
                  Never share your seed phrase. Anyone with it can access your funds.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleCreateWallet}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={20} color={colors.text.inverse} />
                    <Text style={styles.createButtonText}>Create Wallet</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Import Wallet Modal */}
        <Modal
          visible={showImportModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowImportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Import Wallet</Text>
                <TouchableOpacity onPress={() => setShowImportModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Enter your 12 or 24 word seed phrase to import an existing wallet.
              </Text>

              <Text style={styles.inputLabel}>Wallet Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Imported Wallet"
                placeholderTextColor={colors.text.tertiary}
                value={walletName}
                onChangeText={setWalletName}
              />

              <Text style={styles.inputLabel}>Seed Phrase</Text>
              <TextInput
                style={[styles.input, styles.seedInput]}
                placeholder="Enter your seed phrase..."
                placeholderTextColor={colors.text.tertiary}
                value={importSeedPhrase}
                onChangeText={setImportSeedPhrase}
                multiline
                numberOfLines={4}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleImportWallet}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color={colors.text.inverse} />
                    <Text style={styles.createButtonText}>Import Wallet</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Seed Phrase Display Modal */}
        <Modal
          visible={showSeedPhraseModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Your Seed Phrase</Text>
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={colors.status.error} />
                <Text style={[styles.warningText, { color: colors.status.error }]}>
                  Write this down and store it securely. This is the ONLY way to recover your wallet!
                </Text>
              </View>

              <View style={styles.seedPhraseBox}>
                {seedPhrase.split(' ').map((word, index) => (
                  <View key={index} style={styles.seedWord}>
                    <Text style={styles.seedWordNumber}>{index + 1}</Text>
                    <Text style={styles.seedWordText}>{word}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.copyButton} onPress={handleCopySeedPhrase}>
                <Ionicons name="copy-outline" size={18} color={colors.brand.primary} />
                <Text style={styles.copyButtonText}>Copy Seed Phrase</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={handleSeedPhraseAcknowledged}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
                <Text style={styles.acknowledgeButtonText}>I've Saved My Seed Phrase</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Watch Only Modal */}
        <Modal
          visible={showWatchOnlyModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowWatchOnlyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Watch Only Wallet</Text>
                <TouchableOpacity onPress={() => setShowWatchOnlyModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Enter any Solana address to view its balance and transactions. You won't be able to sign transactions.
              </Text>

              <Text style={styles.inputLabel}>Wallet Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Watch Only"
                placeholderTextColor={colors.text.tertiary}
                value={walletName}
                onChangeText={setWalletName}
              />

              <Text style={styles.inputLabel}>Wallet Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Solana address..."
                placeholderTextColor={colors.text.tertiary}
                value={watchOnlyAddress}
                onChangeText={setWatchOnlyAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                onPress={handleAddWatchOnly}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <>
                    <Ionicons name="eye" size={20} color={colors.text.inverse} />
                    <Text style={styles.createButtonText}>Add Watch Only</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Connected view
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand.primary}
          />
        }
      >
        <View style={styles.header}>
          <GradientText style={styles.title}>Wallet</GradientText>
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[colors.brand.primary, colors.accent.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'transparent', 'rgba(255,255,255,0.05)']}
            locations={[0, 0.3, 1]}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>zkRUNE Balance</Text>
            <View style={styles.providerBadge}>
              <Text style={styles.providerText}>
                {getWalletTypeName()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.balanceAmount}>
            {zkRuneBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.balanceUsd}>
            ≈ ${(zkRuneBalance * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
          </Text>
          
          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={styles.balanceAction}
              onPress={() => Alert.alert('Send zkRUNE', 'Send functionality coming soon!')}
            >
              <Ionicons name="arrow-up" size={18} color={colors.text.primary} />
              <Text style={styles.balanceActionText}>Send</Text>
            </TouchableOpacity>
            <View style={styles.balanceDivider} />
            <TouchableOpacity 
              style={styles.balanceAction}
              onPress={handleCopyAddress}
            >
              <Ionicons name="arrow-down" size={18} color={colors.text.primary} />
              <Text style={styles.balanceActionText}>Receive</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Address Card */}
        <Card style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <Text style={styles.addressValue}>
                {connection && shortenAddress(connection.publicKey)}
              </Text>
            </View>
            <View style={styles.addressActions}>
              <TouchableOpacity style={styles.addressBtn} onPress={handleCopyAddress}>
                <Ionicons name="copy-outline" size={18} color={colors.brand.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addressBtn}>
                <Ionicons name="share-outline" size={18} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* SOL Balance */}
        <Card style={styles.solCard}>
          <View style={styles.solRow}>
            <View style={styles.solIcon}>
              <Text style={styles.solSymbol}>◎</Text>
            </View>
            <View style={styles.solInfo}>
              <Text style={styles.solLabel}>SOL Balance</Text>
              <Text style={styles.solValue}>{balance.toFixed(4)} SOL</Text>
            </View>
          </View>
        </Card>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {transactions.length > 0 ? (
          <Card noPadding>
            {transactions.map((tx, index) => (
              <View 
                key={tx.signature}
                style={[
                  styles.txItem,
                  index < transactions.length - 1 && styles.txItemBorder
                ]}
              >
                <View style={[
                  styles.txIcon,
                  { backgroundColor: tx.err ? colors.status.error + '15' : colors.status.success + '15' }
                ]}>
                  <Ionicons 
                    name={tx.err ? 'close' : 'checkmark'} 
                    size={16} 
                    color={tx.err ? colors.status.error : colors.status.success} 
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txSignature}>
                    {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                  </Text>
                  <Text style={styles.txTime}>
                    {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleDateString() : 'Pending'}
                  </Text>
                </View>
                <Text style={[styles.txStatus, tx.err && styles.txStatusError]}>
                  {tx.err ? 'Failed' : 'Success'}
                </Text>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No recent transactions</Text>
          </Card>
        )}

        {/* Disconnect Button */}
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={styles.disconnectText}>Disconnect Wallet</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Wallet Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Wallet</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Create a new Solana wallet. You'll receive a 12-word seed phrase that you must store securely.
            </Text>

            <Text style={styles.inputLabel}>Wallet Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="My Wallet"
              placeholderTextColor={colors.text.tertiary}
              value={walletName}
              onChangeText={setWalletName}
            />

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={colors.status.warning} />
              <Text style={styles.warningText}>
                Never share your seed phrase. Anyone with it can access your funds.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={handleCreateWallet}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color={colors.text.inverse} />
                  <Text style={styles.createButtonText}>Create Wallet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Import Wallet Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Wallet</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter your 12 or 24 word seed phrase to import an existing wallet.
            </Text>

            <Text style={styles.inputLabel}>Wallet Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Imported Wallet"
              placeholderTextColor={colors.text.tertiary}
              value={walletName}
              onChangeText={setWalletName}
            />

            <Text style={styles.inputLabel}>Seed Phrase</Text>
            <TextInput
              style={[styles.input, styles.seedInput]}
              placeholder="Enter your seed phrase..."
              placeholderTextColor={colors.text.tertiary}
              value={importSeedPhrase}
              onChangeText={setImportSeedPhrase}
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={handleImportWallet}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="download" size={20} color={colors.text.inverse} />
                  <Text style={styles.createButtonText}>Import Wallet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seed Phrase Display Modal */}
      <Modal
        visible={showSeedPhraseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Seed Phrase</Text>
            </View>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={colors.status.error} />
              <Text style={[styles.warningText, { color: colors.status.error }]}>
                Write this down and store it securely. This is the ONLY way to recover your wallet!
              </Text>
            </View>

            <View style={styles.seedPhraseBox}>
              {seedPhrase.split(' ').map((word, index) => (
                <View key={index} style={styles.seedWord}>
                  <Text style={styles.seedWordNumber}>{index + 1}</Text>
                  <Text style={styles.seedWordText}>{word}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopySeedPhrase}>
              <Ionicons name="copy-outline" size={18} color={colors.brand.primary} />
              <Text style={styles.copyButtonText}>Copy Seed Phrase</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acknowledgeButton}
              onPress={handleSeedPhraseAcknowledged}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.text.inverse} />
              <Text style={styles.acknowledgeButtonText}>I've Saved My Seed Phrase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing[4],
    marginTop: spacing[2],
  },
  // Connect view styles
  connectCard: {
    borderRadius: layout.radius.xl,
    padding: spacing[8],
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  connectIcon: {
    marginBottom: spacing[4],
  },
  connectTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  connectDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  walletDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  connectingState: {
    alignItems: 'center',
    padding: spacing[6],
  },
  connectingText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing[2],
  },
  connectingSubtext: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  networkCard: {
    marginTop: spacing[6],
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    marginRight: spacing[2],
  },
  networkDotHealthy: {
    backgroundColor: colors.status.success,
  },
  networkLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  networkValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  // Connected view styles
  balanceCard: {
    borderRadius: 24,
    padding: spacing[6],
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  balanceLabel: {
    ...typography.styles.body,
    color: 'rgba(255,255,255,0.75)',
  },
  providerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 8,
  },
  providerText: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  balanceUsd: {
    ...typography.styles.body,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing[6],
  },
  balanceActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: spacing[4],
  },
  balanceAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  balanceActionText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  addressCard: {
    marginBottom: spacing[3],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  addressValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  addressActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  addressBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solCard: {
    marginBottom: spacing[4],
  },
  solRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent.purple + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  solSymbol: {
    fontSize: 24,
    color: colors.accent.purple,
  },
  solInfo: {
    flex: 1,
  },
  solLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
  },
  solValue: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  txItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  txInfo: {
    flex: 1,
  },
  txSignature: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  txTime: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  txStatus: {
    ...typography.styles.bodySmall,
    color: colors.status.success,
    fontWeight: '500',
  },
  txStatusError: {
    color: colors.status.error,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    backgroundColor: colors.status.error + '10',
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    borderColor: colors.status.error + '30',
    gap: spacing[2],
    marginTop: spacing[6],
  },
  disconnectText: {
    ...typography.styles.body,
    color: colors.status.error,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing[6],
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
  },
  modalDescription: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing[6],
    lineHeight: 22,
  },
  inputLabel: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  seedInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.status.warning + '15',
    borderRadius: layout.radius.md,
    padding: spacing[4],
    marginBottom: spacing[6],
    gap: spacing[3],
  },
  warningText: {
    ...typography.styles.bodySmall,
    color: colors.status.warning,
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    gap: spacing[2],
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    ...typography.styles.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  seedPhraseBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background.tertiary,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  seedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minWidth: '30%',
    gap: spacing[2],
  },
  seedWordNumber: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    width: 18,
  },
  seedWordText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary + '15',
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  copyButtonText: {
    ...typography.styles.body,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.success,
    borderRadius: layout.radius.lg,
    padding: spacing[4],
    gap: spacing[2],
  },
  acknowledgeButtonText: {
    ...typography.styles.body,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
