export const Colors = {
  // Apple iOS System Colors (Light / Dark)
  primary: '#007AFF',       // iOS System Blue
  primaryDark: '#0A84FF',
  primaryMuted: 'rgba(0, 122, 255, 0.12)',

  secondary: '#34C759',     // iOS System Green (Success / Online / Full Battery)
  secondaryDark: '#30D158',

  warning: '#FF9500',       // iOS System Orange
  danger: '#FF3B30',        // iOS System Red
  dangerDark: '#FF453A',

  // Neutrals & Backgrounds
  background: '#F2F2F7',    // iOS System Grouped Background
  cardBackground: '#FFFFFF',
  cardBackgroundGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceMuted: '#E5E5EA',

  // Text Colors (High Contrast for Accessibility)
  textPrimary: '#000000',
  textSecondary: '#6C6C70', // iOS System Gray
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',

  // Map & Markers
  markerUser: '#007AFF',
  markerFamily: '#34C759',
  markerRing: '#FFFFFF',
  
  // Borders & Dividers
  border: '#D1D1D6',
  borderSubtle: 'rgba(60, 60, 67, 0.12)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowElevated: 'rgba(0, 0, 0, 0.16)',
} as const;

export type ColorScheme = typeof Colors;
