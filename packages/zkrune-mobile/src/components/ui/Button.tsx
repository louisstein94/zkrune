/**
 * zkRune Button Component
 * Elegant, touch-optimized button with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, layout } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { height: 40, paddingHorizontal: 16, fontSize: 14 },
    md: { height: 52, paddingHorizontal: 24, fontSize: 16 },
    lg: { height: 60, paddingHorizontal: 32, fontSize: 18 },
  };

  const currentSize = sizeStyles[size];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.text.inverse : colors.text.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { fontSize: currentSize.fontSize },
              variant === 'primary' && styles.textPrimary,
              variant === 'secondary' && styles.textSecondary,
              variant === 'ghost' && styles.textGhost,
              variant === 'outline' && styles.textOutline,
              icon ? { marginLeft: 8 } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[{ opacity: isDisabled ? 0.5 : 1 }, style]}
      >
        <LinearGradient
          colors={colors.brand.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            {
              height: currentSize.height,
              paddingHorizontal: currentSize.paddingHorizontal,
            },
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          height: currentSize.height,
          paddingHorizontal: currentSize.paddingHorizontal,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && styles.outline,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: layout.button.radius,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: colors.text.primary,
  },
  textSecondary: {
    color: colors.text.primary,
  },
  textGhost: {
    color: colors.brand.primary,
  },
  textOutline: {
    color: colors.text.primary,
  },
});
