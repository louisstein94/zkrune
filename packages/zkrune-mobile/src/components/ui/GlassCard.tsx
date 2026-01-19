/**
 * zkRune Glass Card Component
 * Glassmorphism effect card
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors, layout, spacing } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
  borderGlow?: boolean;
}

export function GlassCard({
  children,
  style,
  noPadding = false,
  borderGlow = false,
}: GlassCardProps) {
  // Simple card without blur for web compatibility
  return (
    <View
      style={[
        styles.container,
        styles.glassBackground,
        borderGlow && styles.borderGlow,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Simple card without blur (for performance)
export function Card({
  children,
  style,
  noPadding = false,
}: Omit<GlassCardProps, 'intensity' | 'borderGlow'>) {
  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.card.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  glassBackground: {
    backgroundColor: colors.background.glass,
  },
  borderGlow: {
    borderColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  padding: {
    padding: layout.card.padding,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: layout.card.radius,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
});
