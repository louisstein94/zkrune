/**
 * zkRune Mobile Color Palette
 * Elegant dark theme with purple accents
 */

export const colors = {
  // Base colors
  background: {
    primary: '#0A0A0F',      // Deep space black
    secondary: '#12121A',    // Card background
    tertiary: '#1A1A24',     // Elevated surfaces
    glass: 'rgba(18, 18, 26, 0.8)', // Glassmorphism
  },

  // Brand colors
  brand: {
    primary: '#8B5CF6',      // Vibrant purple
    secondary: '#A78BFA',    // Light purple
    tertiary: '#C4B5FD',     // Pale purple
    gradient: ['#8B5CF6', '#EC4899'] as [string, string], // Purple to pink
  },

  // Accent colors
  accent: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    emerald: '#10B981',
    amber: '#F59E0B',
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
