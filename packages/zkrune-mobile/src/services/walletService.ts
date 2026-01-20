/**
 * zkRune Mobile - Wallet Service
 * Native wallet creation, import, and external wallet integration
 */

import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { secureStorage, STORAGE_KEYS } from './secureStorage';

// Polyfill Buffer for React Native
global.Buffer = global.Buffer || Buffer;

// Lazy-loaded crypto modules (not available on web)
let Keypair: typeof import('@solana/web3.js').Keypair;
let bip39: typeof import('bip39');
let nacl: typeof import('tweetnacl');

// Crypto modules ready flag
let cryptoReady = false;

// Initialize crypto modules (only on native)
const initCrypto = async (): Promise<boolean> => {
  if (cryptoReady) return true;
  if (Platform.OS === 'web') return false;
  
  try {
    const web3 = await import('@solana/web3.js');
    Keypair = web3.Keypair;
    bip39 = await import('bip39');
    nacl = (await import('tweetnacl')).default;
    cryptoReady = true;
    console.log('[Wallet] Crypto modules loaded successfully');
    return true;
  } catch (error) {
    console.error('[Wallet] Failed to load crypto modules:', error);
    return false;
  }
};

// Simple seed to keypair (using first 32 bytes of seed)
const seedToKeypair = (seed: Uint8Array): { publicKey: Uint8Array; secretKey: Uint8Array } => {
  // Use first 32 bytes as private key seed
  const seedBytes = seed.slice(0, 32);
  return nacl.sign.keyPair.fromSeed(seedBytes);
};

// Initialize on load
initCrypto();

// Deep link schemes
const PHANTOM_SCHEME = 'phantom://';
const SOLFLARE_SCHEME = 'solflare://';

// zkRune app scheme (defined in app.json)
const APP_SCHEME = 'zkrune://';

// Solana derivation path (m/44'/501'/0'/0')
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

export enum WalletProvider {
  PHANTOM = 'phantom',
  SOLFLARE = 'solflare',
  NATIVE = 'native', // zkRune built-in wallet
}

export enum WalletType {
  EXTERNAL = 'external', // Connected via deep link
  NATIVE = 'native',     // Created in-app
  IMPORTED = 'imported', // Imported via seed phrase
  WATCH_ONLY = 'watch_only', // View-only address
}

export interface WalletConnection {
  publicKey: string;
  provider: WalletProvider;
  walletType: WalletType;
  session?: string;
  name?: string;
}

export interface NativeWallet {
  publicKey: string;
  secretKey: Uint8Array;
  mnemonic?: string;
  name: string;
  walletType: WalletType;
  createdAt: number;
}

export interface TransactionRequest {
  to: string;
  amount: number; // in lamports
  memo?: string;
}

export interface SignatureResult {
  signature: string;
  publicKey: string;
}

/**
 * Wallet connection service with native wallet support
 */
class WalletService {
  private _connection: WalletConnection | null = null;
  private _nativeWallet: NativeWallet | null = null;
  private _pendingAction: string | null = null;
  private _allWallets: WalletConnection[] = [];
  private _loadPromise: Promise<NativeWallet | null> | null = null;
  private _isSaving: boolean = false;

  // =====================================================
  // NATIVE WALLET CREATION & IMPORT
  // =====================================================

  /**
   * Generate a new wallet with mnemonic seed phrase
   */
  async createWallet(name: string = 'My Wallet'): Promise<{ wallet: NativeWallet; mnemonic: string } | null> {
    // Web platform check
    if (Platform.OS === 'web') {
      console.warn('[Wallet] Native wallet creation not supported on web');
      throw new Error('Native wallet creation is only available on mobile devices. Please use Phantom or Solflare on web.');
    }

    try {
      // Ensure crypto is loaded
      if (!bip39 || !Keypair) {
        await initCrypto();
        if (!bip39 || !Keypair) {
          throw new Error('Crypto modules not available');
        }
      }

      // Generate 12-word mnemonic
      const mnemonic = bip39.generateMnemonic(128); // 128 bits = 12 words
      
      // Derive keypair from mnemonic
      const keypair = await this._deriveKeypairFromMnemonic(mnemonic);
      
      const wallet: NativeWallet = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: keypair.secretKey,
        mnemonic,
        name,
        walletType: WalletType.NATIVE,
        createdAt: Date.now(),
      };

      // Save securely
      await this._saveNativeWallet(wallet);
      this._nativeWallet = wallet;

      // Set as active connection
      this._connection = {
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: WalletType.NATIVE,
        name,
      };

      console.log('[Wallet] Created new wallet:', this.shortenAddress(wallet.publicKey));
      
      return { wallet, mnemonic };
    } catch (error) {
      console.error('[Wallet] Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Import wallet from seed phrase (mnemonic)
   */
  async importFromSeedPhrase(mnemonic: string, name: string = 'Imported Wallet'): Promise<NativeWallet | null> {
    // Web platform check
    if (Platform.OS === 'web') {
      console.warn('[Wallet] Wallet import not supported on web');
      throw new Error('Wallet import is only available on mobile devices. Please use Phantom or Solflare on web.');
    }

    try {
      // Ensure crypto is loaded
      if (!bip39 || !Keypair) {
        await initCrypto();
        if (!bip39 || !Keypair) {
          throw new Error('Crypto modules not available');
        }
      }

      // Validate mnemonic
      const isValid = bip39.validateMnemonic(mnemonic.trim().toLowerCase());
      if (!isValid) {
        console.error('[Wallet] Invalid mnemonic phrase');
        throw new Error('Invalid seed phrase. Please check and try again.');
      }

      // Derive keypair
      const keypair = await this._deriveKeypairFromMnemonic(mnemonic.trim().toLowerCase());

      const wallet: NativeWallet = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: keypair.secretKey,
        mnemonic: mnemonic.trim().toLowerCase(),
        name,
        walletType: WalletType.IMPORTED,
        createdAt: Date.now(),
      };

      // Save securely
      await this._saveNativeWallet(wallet);
      this._nativeWallet = wallet;

      // Set as active connection
      this._connection = {
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: WalletType.IMPORTED,
        name,
      };

      console.log('[Wallet] Imported wallet:', this.shortenAddress(wallet.publicKey));

      return wallet;
    } catch (error) {
      console.error('[Wallet] Failed to import wallet:', error);
      throw error;
    }
  }

  /**
   * Import wallet from private key (base58 or array)
   */
  async importFromPrivateKey(privateKey: string | number[], name: string = 'Imported Wallet'): Promise<NativeWallet | null> {
    // Web platform check
    if (Platform.OS === 'web') {
      throw new Error('Wallet import is only available on mobile devices.');
    }

    try {
      // Ensure crypto is loaded
      if (!Keypair) {
        await initCrypto();
        if (!Keypair) {
          throw new Error('Crypto modules not available');
        }
      }

      let secretKey: Uint8Array;

      if (typeof privateKey === 'string') {
        // Base58 encoded private key
        const bs58 = await import('bs58');
        secretKey = bs58.default.decode(privateKey);
      } else {
        // Array of numbers
        secretKey = Uint8Array.from(privateKey);
      }

      const keypair = Keypair.fromSecretKey(secretKey);

      const wallet: NativeWallet = {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: keypair.secretKey,
        name,
        walletType: WalletType.IMPORTED,
        createdAt: Date.now(),
      };

      await this._saveNativeWallet(wallet);
      this._nativeWallet = wallet;

      this._connection = {
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: WalletType.IMPORTED,
        name,
      };

      console.log('[Wallet] Imported wallet from private key:', this.shortenAddress(wallet.publicKey));

      return wallet;
    } catch (error) {
      console.error('[Wallet] Failed to import from private key:', error);
      throw new Error('Invalid private key format');
    }
  }

  /**
   * Add watch-only wallet (view address without private key)
   */
  async addWatchOnlyWallet(address: string, name: string = 'Watch Only'): Promise<WalletConnection | null> {
    try {
      // Validate Solana address format
      if (!this._isValidSolanaAddress(address)) {
        throw new Error('Invalid Solana address');
      }

      const connection: WalletConnection = {
        publicKey: address,
        provider: WalletProvider.NATIVE,
        walletType: WalletType.WATCH_ONLY,
        name,
      };

      // Save to wallet list
      await this._addToWalletList(connection);
      
      console.log('[Wallet] Added watch-only wallet:', this.shortenAddress(address));

      return connection;
    } catch (error) {
      console.error('[Wallet] Failed to add watch-only wallet:', error);
      throw error;
    }
  }

  /**
   * Export seed phrase (requires biometric auth in production)
   */
  async exportSeedPhrase(): Promise<string | null> {
    try {
      if (!this._nativeWallet?.mnemonic) {
        // Try to load from storage
        const wallet = await this._loadNativeWallet();
        if (!wallet?.mnemonic) {
          throw new Error('No seed phrase available for this wallet');
        }
        return wallet.mnemonic;
      }
      return this._nativeWallet.mnemonic;
    } catch (error) {
      console.error('[Wallet] Failed to export seed phrase:', error);
      return null;
    }
  }

  /**
   * Export private key as base58
   */
  async exportPrivateKey(): Promise<string | null> {
    try {
      const wallet = this._nativeWallet || await this._loadNativeWallet();
      if (!wallet?.secretKey) {
        throw new Error('No private key available');
      }
      const bs58 = await import('bs58');
      return bs58.default.encode(wallet.secretKey);
    } catch (error) {
      console.error('[Wallet] Failed to export private key:', error);
      return null;
    }
  }

  /**
   * Get native wallet keypair for signing
   */
  async getKeypair(): Promise<any | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      if (!Keypair) {
        await initCrypto();
      }

      const wallet = this._nativeWallet || await this._loadNativeWallet();
      if (!wallet?.secretKey || !Keypair) {
        return null;
      }
      return Keypair.fromSecretKey(wallet.secretKey);
    } catch (error) {
      console.error('[Wallet] Failed to get keypair:', error);
      return null;
    }
  }

  /**
   * Sign data with native wallet
   */
  async signData(data: Uint8Array): Promise<Uint8Array | null> {
    if (Platform.OS === 'web') {
      throw new Error('Signing not available on web');
    }

    try {
      if (!nacl) {
        await initCrypto();
      }

      const keypair = await this.getKeypair();
      if (!keypair || !nacl) {
        throw new Error('No native wallet available for signing');
      }
      return nacl.sign.detached(data, keypair.secretKey);
    } catch (error) {
      console.error('[Wallet] Failed to sign data:', error);
      return null;
    }
  }

  /**
   * Get all saved wallets
   */
  async getAllWallets(): Promise<WalletConnection[]> {
    try {
      const walletsJson = await secureStorage.get(STORAGE_KEYS.WALLET_PUBLIC_KEY + '_list');
      if (walletsJson) {
        this._allWallets = JSON.parse(walletsJson);
      }
      return this._allWallets;
    } catch (error) {
      console.error('[Wallet] Failed to get all wallets:', error);
      return [];
    }
  }

  /**
   * Check if native wallet exists
   */
  async hasNativeWallet(): Promise<boolean> {
    const wallet = await this._loadNativeWallet();
    return wallet !== null;
  }

  // =====================================================
  // EXTERNAL WALLET CONNECTION (Phantom/Solflare)
  // =====================================================

  /**
   * Check if a wallet app is installed
   */
  async isWalletInstalled(provider: WalletProvider): Promise<boolean> {
    try {
      const scheme = provider === WalletProvider.PHANTOM ? PHANTOM_SCHEME : SOLFLARE_SCHEME;
      return await Linking.canOpenURL(scheme);
    } catch (error) {
      console.error(`[Wallet] Failed to check ${provider} installation:`, error);
      return false;
    }
  }

  /**
   * Get available wallets
   */
  async getAvailableWallets(): Promise<WalletProvider[]> {
    const available: WalletProvider[] = [];
    
    if (await this.isWalletInstalled(WalletProvider.PHANTOM)) {
      available.push(WalletProvider.PHANTOM);
    }
    
    if (await this.isWalletInstalled(WalletProvider.SOLFLARE)) {
      available.push(WalletProvider.SOLFLARE);
    }
    
    return available;
  }

  /**
   * Connect to Phantom wallet
   */
  async connectPhantom(): Promise<boolean> {
    try {
      const isInstalled = await this.isWalletInstalled(WalletProvider.PHANTOM);
      
      if (!isInstalled) {
        // Open app store
        await Linking.openURL('https://phantom.app/download');
        return false;
      }

      // Build connect URL
      const redirectUrl = encodeURIComponent(`${APP_SCHEME}wallet/callback`);
      const cluster = 'mainnet-beta'; // or 'devnet' for testing
      const appUrl = encodeURIComponent('https://zkrune.com');
      
      const connectUrl = `${PHANTOM_SCHEME}v1/connect?` +
        `app_url=${appUrl}&` +
        `dapp_encryption_public_key=${await this._getEncryptionPublicKey()}&` +
        `redirect_link=${redirectUrl}&` +
        `cluster=${cluster}`;
      
      this._pendingAction = 'connect_phantom';
      await Linking.openURL(connectUrl);
      
      return true;
    } catch (error) {
      console.error('[Wallet] Failed to connect Phantom:', error);
      return false;
    }
  }

  /**
   * Connect to Solflare wallet
   */
  async connectSolflare(): Promise<boolean> {
    try {
      const isInstalled = await this.isWalletInstalled(WalletProvider.SOLFLARE);
      
      if (!isInstalled) {
        await Linking.openURL('https://solflare.com/download');
        return false;
      }

      const redirectUrl = encodeURIComponent(`${APP_SCHEME}wallet/callback`);
      const cluster = 'mainnet-beta';
      
      const connectUrl = `${SOLFLARE_SCHEME}ul/v1/connect?` +
        `app_url=${encodeURIComponent('https://zkrune.com')}&` +
        `redirect_link=${redirectUrl}&` +
        `cluster=${cluster}`;
      
      this._pendingAction = 'connect_solflare';
      await Linking.openURL(connectUrl);
      
      return true;
    } catch (error) {
      console.error('[Wallet] Failed to connect Solflare:', error);
      return false;
    }
  }

  /**
   * Handle deep link callback
   */
  async handleCallback(url: string): Promise<WalletConnection | null> {
    try {
      const parsedUrl = Linking.parse(url);
      const params = parsedUrl.queryParams || {};

      // Check for errors
      if (params.errorCode || params.error) {
        console.error('[Wallet] Connection error:', params.errorMessage || params.error);
        return null;
      }

      // Extract public key
      const publicKey = params.phantom_encryption_public_key || 
                        params.public_key || 
                        params.publicKey;

      if (!publicKey || typeof publicKey !== 'string') {
        console.error('[Wallet] No public key in callback');
        return null;
      }

      // Determine provider
      const provider = this._pendingAction?.includes('phantom') 
        ? WalletProvider.PHANTOM 
        : WalletProvider.SOLFLARE;

      // Create connection
      const connection: WalletConnection = {
        publicKey,
        provider,
        session: params.session as string | undefined,
      };

      // Store connection
      await this._saveConnection(connection);
      this._connection = connection;
      this._pendingAction = null;

      return connection;
    } catch (error) {
      console.error('[Wallet] Failed to handle callback:', error);
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<boolean> {
    try {
      // Clear connection from storage
      await secureStorage.removeWallet();
      this._connection = null;
      return true;
    } catch (error) {
      console.error('[Wallet] Failed to disconnect:', error);
      return false;
    }
  }

  /**
   * Get current connection
   */
  async getConnection(): Promise<WalletConnection | null> {
    if (this._connection) {
      return this._connection;
    }

    // First try to load native wallet
    const nativeWallet = await this._loadNativeWallet();
    if (nativeWallet) {
      this._nativeWallet = nativeWallet;
      this._connection = {
        publicKey: nativeWallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: nativeWallet.walletType,
        name: nativeWallet.name,
      };
      return this._connection;
    }

    // Try to restore external wallet from storage
    const wallet = await secureStorage.getWallet();
    if (wallet) {
      // Parse stored connection data
      try {
        const storedData = JSON.parse(wallet.secretKey) as Partial<WalletConnection>;
        this._connection = {
          publicKey: wallet.publicKey,
          provider: storedData.provider || WalletProvider.PHANTOM,
          walletType: storedData.walletType || WalletType.EXTERNAL,
          session: storedData.session,
          name: storedData.name,
        };
        return this._connection;
      } catch {
        // Legacy format - just public key
        this._connection = {
          publicKey: wallet.publicKey,
          provider: WalletProvider.PHANTOM,
          walletType: WalletType.EXTERNAL,
        };
        return this._connection;
      }
    }

    return null;
  }

  /**
   * Get native wallet (sync, returns cached value)
   */
  getNativeWallet(): NativeWallet | null {
    return this._nativeWallet;
  }

  /**
   * Get native wallet async (loads from storage if needed)
   */
  async getNativeWalletAsync(): Promise<NativeWallet | null> {
    if (this._nativeWallet) {
      return this._nativeWallet;
    }
    return this._loadNativeWallet();
  }

  /**
   * Check if wallet is connected
   */
  async isConnected(): Promise<boolean> {
    const connection = await this.getConnection();
    return connection !== null;
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<SignatureResult | null> {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('No wallet connected');
      }

      const encodedMessage = Buffer.from(message).toString('base64');
      const redirectUrl = encodeURIComponent(`${APP_SCHEME}wallet/sign-callback`);

      let signUrl: string;

      if (connection.provider === WalletProvider.PHANTOM) {
        signUrl = `${PHANTOM_SCHEME}v1/signMessage?` +
          `message=${encodeURIComponent(encodedMessage)}&` +
          `redirect_link=${redirectUrl}&` +
          `display=utf8`;
      } else {
        signUrl = `${SOLFLARE_SCHEME}ul/v1/signMessage?` +
          `message=${encodeURIComponent(encodedMessage)}&` +
          `redirect_link=${redirectUrl}`;
      }

      this._pendingAction = 'sign_message';
      await Linking.openURL(signUrl);

      // Note: The actual signature will come back via the callback
      // This function initiates the signing process
      return null;
    } catch (error) {
      console.error('[Wallet] Failed to sign message:', error);
      return null;
    }
  }

  /**
   * Request transaction signature
   */
  async signTransaction(transaction: string): Promise<string | null> {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('No wallet connected');
      }

      const redirectUrl = encodeURIComponent(`${APP_SCHEME}wallet/tx-callback`);

      let signUrl: string;

      if (connection.provider === WalletProvider.PHANTOM) {
        signUrl = `${PHANTOM_SCHEME}v1/signTransaction?` +
          `transaction=${encodeURIComponent(transaction)}&` +
          `redirect_link=${redirectUrl}`;
      } else {
        signUrl = `${SOLFLARE_SCHEME}ul/v1/signTransaction?` +
          `transaction=${encodeURIComponent(transaction)}&` +
          `redirect_link=${redirectUrl}`;
      }

      this._pendingAction = 'sign_transaction';
      await Linking.openURL(signUrl);

      return null;
    } catch (error) {
      console.error('[Wallet] Failed to sign transaction:', error);
      return null;
    }
  }

  /**
   * Get shortened address for display
   */
  shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  /**
   * Get wallet provider display name
   */
  getProviderName(provider: WalletProvider): string {
    return provider === WalletProvider.PHANTOM ? 'Phantom' : 'Solflare';
  }

  /**
   * Get wallet provider icon
   */
  getProviderIcon(provider: WalletProvider): string {
    return provider === WalletProvider.PHANTOM ? 'wallet-outline' : 'sunny-outline';
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private async _saveConnection(connection: WalletConnection): Promise<void> {
    await secureStorage.saveWallet(
      connection.publicKey,
      JSON.stringify({
        provider: connection.provider,
        walletType: connection.walletType || WalletType.EXTERNAL,
        session: connection.session,
        name: connection.name,
      })
    );
    
    // Add to wallet list
    await this._addToWalletList(connection);
  }

  private async _saveNativeWallet(wallet: NativeWallet): Promise<void> {
    // Set saving flag to prevent race conditions with load
    this._isSaving = true;
    
    try {
      // Save wallet in separate keys to avoid SecureStore 2048 byte limit
      // Save secret key as base64
      const secretKeyBase64 = Buffer.from(wallet.secretKey).toString('base64');
      
      const walletMeta = {
        publicKey: wallet.publicKey,
        name: wallet.name,
        walletType: wallet.walletType,
        createdAt: wallet.createdAt,
        hasMnemonic: !!wallet.mnemonic,
      };
      
      console.log('[Wallet] Saving wallet...', wallet.publicKey.slice(0, 8));
      
      // Save metadata
      const metaSuccess = await secureStorage.set(
        STORAGE_KEYS.WALLET_SECRET,
        JSON.stringify(walletMeta)
      );
      
      // Save secret key separately
      const keySuccess = await secureStorage.set(
        'zkrune_wallet_sk' as any,
        secretKeyBase64
      );
      
      // Save mnemonic separately if exists
      if (wallet.mnemonic) {
        await secureStorage.set(
          'zkrune_wallet_mnemonic' as any,
          wallet.mnemonic
        );
      }
      
      console.log('[Wallet] Wallet saved:', metaSuccess && keySuccess ? 'SUCCESS' : 'FAILED');
      
      await secureStorage.set(STORAGE_KEYS.WALLET_PUBLIC_KEY, wallet.publicKey);

      // Also save as connection
      await this._saveConnection({
        publicKey: wallet.publicKey,
        provider: WalletProvider.NATIVE,
        walletType: wallet.walletType,
        name: wallet.name,
      });
    } finally {
      this._isSaving = false;
    }
  }

  private async _loadNativeWallet(): Promise<NativeWallet | null> {
    // If already in memory, return cached version
    if (this._nativeWallet) {
      return this._nativeWallet;
    }
    
    // If save in progress, wait a bit and return in-memory version
    if (this._isSaving) {
      console.log('[Wallet] Save in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 100));
      return this._nativeWallet;
    }
    
    // If another load is already in progress, wait for it
    if (this._loadPromise) {
      return this._loadPromise;
    }
    
    // Start new load operation
    this._loadPromise = this._doLoadNativeWallet();
    try {
      const result = await this._loadPromise;
      return result;
    } finally {
      this._loadPromise = null;
    }
  }
  
  private async _doLoadNativeWallet(): Promise<NativeWallet | null> {
    try {
      // Load wallet metadata
      const walletJson = await secureStorage.get(STORAGE_KEYS.WALLET_SECRET);
      if (!walletJson) {
        console.log('[Wallet] No wallet in storage');
        return null;
      }

      let meta;
      try {
        meta = JSON.parse(walletJson);
      } catch (parseError) {
        console.warn('[Wallet] Failed to parse wallet metadata');
        return null;
      }
      
      // Validate metadata has required fields
      if (!meta || !meta.publicKey) {
        console.warn('[Wallet] Invalid wallet metadata structure');
        return null;
      }
      
      // Load secret key
      const secretKeyBase64 = await secureStorage.get('zkrune_wallet_sk' as any);
      if (!secretKeyBase64) {
        console.warn('[Wallet] No secret key found');
        return null;
      }

      // Load mnemonic if exists
      let mnemonic: string | undefined;
      if (meta.hasMnemonic) {
        mnemonic = await secureStorage.get('zkrune_wallet_mnemonic' as any) || undefined;
      }

      // Decode secret key
      const secretKey = new Uint8Array(Buffer.from(secretKeyBase64, 'base64'));

      console.log('[Wallet] Wallet loaded:', meta.publicKey.slice(0, 8) + '...');
      
      const wallet: NativeWallet = {
        publicKey: meta.publicKey,
        secretKey,
        mnemonic,
        name: meta.name || 'My Wallet',
        walletType: meta.walletType || WalletType.NATIVE,
        createdAt: meta.createdAt || Date.now(),
      };
      
      // Cache in memory
      this._nativeWallet = wallet;
      
      return wallet;
    } catch (error) {
      console.error('[Wallet] Failed to load native wallet:', error);
      return null;
    }
  }

  private async _deriveKeypairFromMnemonic(mnemonic: string): Promise<any> {
    if (!bip39 || !nacl || !Keypair) {
      throw new Error('Crypto modules not initialized');
    }

    // Convert mnemonic to seed
    const seed = await bip39.mnemonicToSeed(mnemonic);
    
    // Use first 32 bytes of seed directly (simple derivation)
    // Note: This is compatible with Solana CLI and most wallets
    const seedArray = new Uint8Array(seed);
    const keypairSeed = seedToKeypair(seedArray);
    
    // Create Solana keypair from the generated keys
    return Keypair.fromSecretKey(keypairSeed.secretKey);
  }

  private async _addToWalletList(connection: WalletConnection): Promise<void> {
    const wallets = await this.getAllWallets();
    
    // Check if already exists
    const exists = wallets.find(w => w.publicKey === connection.publicKey);
    if (!exists) {
      wallets.push(connection);
      await secureStorage.set(
        STORAGE_KEYS.WALLET_PUBLIC_KEY + '_list',
        JSON.stringify(wallets)
      );
      this._allWallets = wallets;
    }
  }

  private _isValidSolanaAddress(address: string): boolean {
    // Basic validation: 32-44 characters, base58 alphabet
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  private async _clearWalletStorage(): Promise<void> {
    try {
      await secureStorage.delete(STORAGE_KEYS.WALLET_SECRET);
      await secureStorage.delete('zkrune_wallet_sk' as any);
      await secureStorage.delete('zkrune_wallet_mnemonic' as any);
      console.log('[Wallet] Cleared wallet storage');
    } catch (error) {
      console.error('[Wallet] Failed to clear wallet storage:', error);
    }
  }

  private async _getEncryptionPublicKey(): Promise<string> {
    // In production, generate a proper encryption keypair
    // For now, return a placeholder
    return 'zkRune-dapp-encryption-key';
  }
}

// Export types
export type { NativeWallet };

export const walletService = new WalletService();
export default walletService;
