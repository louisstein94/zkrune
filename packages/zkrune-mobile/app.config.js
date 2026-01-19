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
      backgroundColor: "#0A0A0F"
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
        backgroundColor: "#0A0A0F"
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
          color: "#8B5CF6"
        }
      ],
      "expo-font"
    ],
    extra: {
      // Environment variables - loaded from .env or defaults
      heliusApiKey: process.env.HELIUS_API_KEY || '',
      eas: {
        projectId: "your-project-id"
      }
    },
    scheme: "zkrune"
  }
};
