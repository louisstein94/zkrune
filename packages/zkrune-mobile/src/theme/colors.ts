/**
 * zkRune Mobile Color Palette
 * Mystical metallic theme with cyan/teal zkRune accent
 */

export const colors = {
  // Base colors - Deep mystical backgrounds
  background: {
    primary: '#06080F',      // Deep space black
    secondary: '#0A0E18',    // Card background
    tertiary: '#101624',     // Elevated surfaces
    glass: 'rgba(10, 14, 24, 0.85)', // Glassmorphism
  },

  // Brand colors - zkRune Cyan/Teal theme
  brand: {
    primary: '#06B6D4',      // zkRune Cyan
    secondary: '#0EA5E9',    // Sky blue
    tertiary: '#22D3EE',     // Light cyan
    gradient: ['#0EA5E9', '#14B8A6'] as [string, string], // Cyan to Teal
  },

  // Accent colors
  accent: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
    teal: '#14B8A6',        // zkRune teal
    rune: '#5EEAD4',        // Mystical rune glow
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',    // Muted gray
    tertiary: '#71717A',     // Dimmed
    inverse: '#0A0A0F',
  },

  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Border colors
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(139, 92, 246, 0.5)',
  },

  // Overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
} as const;

export type Colors = typeof colors;
