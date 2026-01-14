# zkRune Mobile

Privacy-focused ZK proofs on Solana - Native Android App

## Features

- **Zero-Knowledge Proofs**: Generate and verify ZK proofs on your phone
- **Wallet Integration**: Connect Phantom/Solflare via deep links
- **Offline Capable**: Generate proofs without internet
- **Biometric Security**: Face ID / Fingerprint authentication
- **Beautiful UI**: Elegant dark theme with purple accents

## Tech Stack

- React Native + Expo SDK 50
- TypeScript
- @react-navigation for navigation
- expo-secure-store for secure storage
- expo-local-authentication for biometrics

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Android Studio (for local builds)

### Development

```bash
# Install dependencies
cd packages/zkrune-mobile
npm install

# Start development server
npm start

# Run on Android emulator
npm run android
```

### Building APK

```bash
# Preview build (APK for testing)
npm run build:apk

# Production build (AAB for Play Store)
npm run build:aab
```

## Project Structure

```
zkrune-mobile/
├── App.tsx                 # App entry point
├── app.json               # Expo configuration
├── src/
│   ├── components/
│   │   └── ui/            # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── GlassCard.tsx
│   │       └── GradientText.tsx
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   ├── ProofScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── theme/             # Design system
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
└── assets/                # Images, fonts
```

## Design System

### Colors

```typescript
const colors = {
  background: {
    primary: '#0A0A0F',    // Deep space black
    secondary: '#12121A',   // Card background
  },
  brand: {
    primary: '#8B5CF6',     // Vibrant purple
    gradient: ['#8B5CF6', '#EC4899'], // Purple to pink
  },
};
```

### Components

- `Button` - Primary, secondary, ghost, outline variants
- `Card` - Standard card with subtle border
- `GlassCard` - Glassmorphism effect
- `GradientText` - Animated gradient text

## Wallet Integration

Uses Phantom/Solflare deep links:

```typescript
import * as Linking from 'expo-linking';

// Connect to Phantom
const connectPhantom = () => {
  const url = `phantom://connect?dapp_encryption_public_key=${publicKey}&redirect_link=${callbackUrl}`;
  Linking.openURL(url);
};
```

## License

MIT - zkRune Team
