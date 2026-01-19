/**
 * zkRune Mobile Spacing & Layout
 * Consistent spacing system
 */

export const spacing = {
  // Base spacing scale (4px base)
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,

  // Semantic spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const layout = {
  // Border radius
  radius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Screen padding
  screenPadding: 20,

  // Card dimensions
  card: {
    padding: 16,
    radius: 16,
  },

  // Button dimensions
  button: {
    height: 52,
    radius: 12,
    paddingHorizontal: 24,
  },

  // Input dimensions
  input: {
    height: 52,
    radius: 12,
    paddingHorizontal: 16,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Bottom tab bar
  tabBar: {
    height: 84,
    paddingBottom: 24,
  },
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
