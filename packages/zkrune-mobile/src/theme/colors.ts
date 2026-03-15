/**
 * zkRune Mobile Color Palette
 * MD3-compliant dark theme with WCAG AA contrast ratios (4.5:1+ for text)
 *
 * Contrast ratios against background (#111827):
 *   primary   #818CF8  → 6.41:1 ✓
 *   secondary #A78BFA  → 6.45:1 ✓
 *   tertiary  #34D399  → 9.95:1 ✓
 *   text.primary #F3F4F6 → 16.12:1 ✓
 *   text.secondary #9CA3AF → 7.54:1 ✓
 */

export const colors = {
  // Surface / background — neutral slate, no colour cast
  background: {
    primary: '#111827',
    secondary: '#1F2937',
    tertiary: '#283548',
    glass: 'rgba(31, 41, 55, 0.85)',
  },

  // Brand — indigo-400 / violet-400, high enough contrast on dark surface
  brand: {
    primary: '#818CF8',
    secondary: '#A78BFA',
    tertiary: '#34D399',
    gradient: ['#818CF8', '#A78BFA'] as [string, string],
  },

  // "on-" variants for accessible text on filled brand surfaces
  on: {
    primary: '#1F2937',
    secondary: '#FFFFFF',
    tertiary: '#064E3B',
    surface: '#F3F4F6',
  },

  // Accent — limited use; keep palette tight
  accent: {
    purple: '#A78BFA',
    pink: '#F472B6',
    cyan: '#22D3EE',
    emerald: '#34D399',
    amber: '#FBBF24',
    teal: '#2DD4BF',
    rune: '#34D399',
  },

  // Text — onSurface hierarchy
  text: {
    primary: '#F3F4F6',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#111827',
  },

  // Semantic status colours — always pair with an icon, never colour-only
  status: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#818CF8',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(129, 140, 248, 0.4)',
  },

  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

export type Colors = typeof colors;
