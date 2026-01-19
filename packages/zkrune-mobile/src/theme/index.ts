/**
 * zkRune Mobile Theme
 * Unified theme export
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing, layout } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  layout,
} as const;

export type Theme = typeof theme;

// Shadow presets for elevation
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;
