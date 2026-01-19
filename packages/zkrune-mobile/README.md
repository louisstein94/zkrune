# zkRune Mobile

Privacy-focused ZK proofs on Solana - Native iOS & Android App

## Features

### Core Functionality
- **Zero-Knowledge Proofs**: Generate and verify ZK proofs on your phone
- **6 Proof Templates**: Age verification, balance proof, membership, credentials, voting, reputation
- **Wallet Integration**: Connect Phantom/Solflare via deep links
- **Offline Capable**: Download circuits for offline proof generation
- **Biometric Security**: Face ID / Touch ID / Fingerprint authentication
- **Push Notifications**: Proof verifications, governance alerts, transaction updates

### Beautiful UI
- Elegant dark theme with purple/cyan gradients
- Glassmorphism effects
- Smooth animations
- zkRune branding with rune symbols

## Tech Stack

- **Framework**: React Native + Expo SDK 52
- **Language**: TypeScript
- **Navigation**: @react-navigation/native v7
- **State**: React Hooks + Context
- **Storage**: expo-secure-store (encrypted)
- **Auth**: expo-local-authentication (biometrics)
- **Notifications**: expo-notifications
- **Blockchain**: Solana JSON-RPC

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Android Studio or Xcode

### Installation

```bash
# Navigate to mobile package
cd packages/zkrune-mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios
```

### Building for Production

```bash
# Preview build (APK for testing)
npm run build:apk

# Production build (AAB for Play Store)
npm run build:aab

# iOS build (IPA for App Store)
npm run build:ios
```

## Project Structure

```
zkrune-mobile/
├── App.tsx                    # App entry point
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
├── src/
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx     # Primary/secondary/ghost buttons
│   │       ├── GlassCard.tsx  # Glassmorphism cards
│   │       └── GradientText.tsx
│   ├── config/
│   │   └── circuits.ts        # Offline circuit configuration
│   ├── hooks/                 # React hooks
│   │   ├── useBiometric.ts    # Biometric auth hook
│   │   ├── useNotifications.ts
│   │   ├── useSolana.ts       # Blockchain operations
│   │   ├── useWallet.ts       # Wallet connection
│   │   └── useZkProof.ts      # Proof generation
│   ├── navigation/            # React Navigation setup
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx     # Dashboard
│   │   ├── ProofScreen.tsx    # Proof generation
│   │   ├── WalletScreen.tsx   # Wallet management
│   │   └── SettingsScreen.tsx # Preferences
│   ├── services/              # Core services
│   │   ├── biometricAuth.ts   # Biometric authentication
│   │   ├── notificationService.ts
│   │   ├── secureStorage.ts   # Encrypted storage
│   │   ├── solanaRpc.ts       # Blockchain RPC
│   │   ├── walletService.ts   # Wallet deep links
│   │   └── zkProofService.ts  # ZK proof generation
│   └── theme/                 # Design system
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
└── assets/                    # Images, icons, fonts
```

## Services

### Secure Storage
Encrypted key-value storage using `expo-secure-store`:
```typescript
import { secureStorage } from './services';

// Store sensitive data
await secureStorage.set(STORAGE_KEYS.WALLET_SECRET, secretKey);

// Retrieve data
const secret = await secureStorage.get(STORAGE_KEYS.WALLET_SECRET);
```

### Biometric Authentication
Face ID / Touch ID / Fingerprint:
```typescript
import { useBiometric } from './hooks';

const { authenticate, isAvailable, biometricName } = useBiometric();

const result = await authenticate('Confirm transaction');
if (result.success) {
  // Proceed with action
}
```

### Wallet Connection
Phantom & Solflare via deep links:
```typescript
import { useWallet } from './hooks';

const { connect, connection, isConnected, zkRuneBalance } = useWallet();

// Connect to Phantom
await connect(WalletProvider.PHANTOM);

// Get balance
console.log(`Balance: ${zkRuneBalance} zkRUNE`);
```

### ZK Proof Generation
Generate zero-knowledge proofs:
```typescript
import { useZkProof } from './hooks';

const { generateProof, isGenerating, currentProof } = useZkProof();

const proof = await generateProof({
  type: 'age-verification',
  privateInputs: { birthYear: '1990' },
  publicInputs: { ageThreshold: '18' },
});
```

### Push Notifications
Configurable notification channels:
```typescript
import { useNotifications } from './hooks';

const { requestPermissions, settings, updateSettings } = useNotifications();

// Request permissions
await requestPermissions();

// Configure channels
await updateSettings({ governanceEnabled: true });
```

## Offline Support

Download circuits for offline proof generation:

```typescript
import { downloadCircuit, areCircuitsCached } from './config/circuits';

// Check if cached
const cached = await areCircuitsCached('age-verification');

// Download if needed
if (!cached) {
  await downloadCircuit('age-verification', (progress) => {
    console.log(`Progress: ${progress}%`);
  });
}
```

## Design System

### Colors

```typescript
const colors = {
  background: {
    primary: '#0A0A0F',      // Deep space black
    secondary: '#12121A',    // Card background
  },
  brand: {
    primary: '#8B5CF6',      // Vibrant purple
    gradient: ['#8B5CF6', '#EC4899'], // Purple to pink
  },
  accent: {
    cyan: '#06B6D4',
    emerald: '#10B981',
  },
};
```

### Typography

```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
};
```

## Deep Links

The app handles the following deep link schemes:

| Scheme | Purpose |
|--------|---------|
| `zkrune://wallet/callback` | Wallet connection callback |
| `zkrune://wallet/sign-callback` | Message signing callback |
| `zkrune://wallet/tx-callback` | Transaction signing callback |
| `zkrune://verify/{proofId}` | Open proof verification |

## Security

- All sensitive data stored with `expo-secure-store` (Keychain/Keystore)
- Biometric authentication for critical operations
- No private keys transmitted over network
- ZK proofs generated locally on device

## License

MIT - zkRune Team
