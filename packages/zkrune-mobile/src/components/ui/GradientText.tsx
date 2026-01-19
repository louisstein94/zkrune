/**
 * zkRune Gradient Text Component
 * Beautiful gradient text for headlines
 */

import React from 'react';
import { Text, TextStyle, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../theme';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
}

export function GradientText({
  children,
  style,
}: GradientTextProps) {
  // Simplified for web compatibility - just use brand color
  return (
    <Text style={[styles.text, style, { color: colors.brand.primary }]}>
      {children}
    </Text>
  );
}

const styles = {
  text: {
    ...typography.styles.h1,
    color: colors.text.primary,
  } as TextStyle,
};
