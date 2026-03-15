/**
 * zkRune Mobile - Dynamic Expo Config
 * Loads environment variables securely
 */

export default {
  expo: {
    name: "zkRune",
    slug: "zkrune-mobile",
    version: "0.2.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#111827"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zkrune.mobile",
      infoPlist: {
        NSFaceIDUsageDescription: "zkRune uses Face ID to secure your wallet and proofs",
        NSCameraUsageDescription: "zkRune uses the camera to scan QR codes"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111827"
      },
      package: "com.zkrune.mobile",
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "zkrune" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-secure-store",
      "expo-local-authentication",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#818CF8"
        }
      ],
      "expo-font",
      "expo-splash-screen"
    ],
    extra: {
      heliusApiKey: process.env.HELIUS_API_KEY || 'HELIUS_API_KEY_REDACTED',
      eas: {
        projectId: "446873f4-f55f-4cca-84d8-a184c48d00d8"
      },
    },
    scheme: "zkrune"
  }
};
