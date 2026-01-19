/**
 * zkRune Mobile - Services Index
 * Export all services for easy imports
 */

// Secure Storage
export { 
  secureStorage, 
  STORAGE_KEYS, 
  type StorageKey 
} from './secureStorage';

// Biometric Authentication
export { 
  biometricAuth, 
  BiometricType,
  type BiometricStatus,
  type AuthResult,
} from './biometricAuth';

// Wallet Connection
export { 
  walletService, 
  WalletProvider,
  WalletType,
  type WalletConnection,
  type NativeWallet,
  type TransactionRequest,
  type SignatureResult,
} from './walletService';

// Solana RPC
export { 
  solanaRpc, 
  RPC_ENDPOINTS,
  ZKRUNE_TOKEN,
  type Network,
  type TokenBalance,
  type AccountInfo,
  type TransactionInfo,
  type TokenInfo,
} from './solanaRpc';

// ZK Proof Service
export { 
  zkProofService, 
  PROOF_TEMPLATES,
  type ProofType,
  type ProofInput,
  type ZKProof,
  type ProofResult,
} from './zkProofService';

// Push Notifications
export { 
  notificationService, 
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
  type NotificationPayload,
  type NotificationSettings,
} from './notificationService';

// Price Service
export {
  priceService,
  type TokenPrice,
} from './priceService';

// Bundled Verification Keys
export { VERIFICATION_KEYS } from './verificationKeys';

/**
 * Initialize all services
 */
export async function initializeServices(): Promise<void> {
  console.log('[Services] Initializing...');
  
  try {
    // Initialize in order of dependency
    await import('./secureStorage').then(m => m.secureStorage);
    await import('./solanaRpc').then(m => m.solanaRpc.init());
    await import('./zkProofService').then(m => m.zkProofService.init());
    await import('./notificationService').then(m => m.notificationService.init());
    
    console.log('[Services] All services initialized');
  } catch (error) {
    console.error('[Services] Failed to initialize:', error);
  }
}
