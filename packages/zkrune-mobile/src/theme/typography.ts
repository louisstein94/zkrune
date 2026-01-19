/**
 * zkRune Mobile Typography
 * Clean, modern type system
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
});

export const typography = {
  // Font families
  fonts: {
    regular: fontFamily,
    medium: fontFamily,
    bold: fontFamily,
    mono: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },

  // Font sizes
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 48,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Pre-defined text styles
  styles: {
    // Headlines
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 44,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 36,
    },
    h3: {
      fontSize: 22,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 28,
    },

    // Body
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },

    // Labels
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      lineHeight: 16,
      textTransform: 'uppercase' as const,
    },

    // Mono (for hashes, addresses)
    mono: {
      fontSize: 13,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
      letterSpacing: 0,
      lineHeight: 20,
    },

    // Button
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
      lineHeight: 24,
    },
  },
} as const;

export type Typography = typeof typography;
