/**
 * Paletas de color de la app, basadas en los colores de sistema de iOS.
 *
 * Las dos tienen exactamente las mismas claves (lo garantiza el tipo `ThemeColors`), así que
 * un componente nunca puede quedarse sin su color en uno de los modos. Los componentes no
 * importan una paleta directamente: la obtienen de `useTheme()` o `makeStyles()`, que eligen
 * la clara o la oscura según la preferencia del usuario.
 */
export const LightColors = {
  primary: '#007AFF',
  primaryDark: '#0A84FF',
  primaryMuted: 'rgba(0, 122, 255, 0.12)',
  /** Fondo del elemento seleccionado en una lista. */
  primarySubtle: 'rgba(0, 122, 255, 0.08)',

  secondary: '#34C759',
  secondaryDark: '#30D158',
  secondaryMuted: 'rgba(52, 199, 89, 0.12)',

  warning: '#FF9500',
  warningMuted: 'rgba(255, 149, 0, 0.12)',
  /** Texto naranja legible sobre `warningMuted`. */
  warningText: '#B26A00',

  danger: '#FF3B30',
  dangerDark: '#FF453A',
  dangerMuted: 'rgba(255, 59, 48, 0.12)',
  dangerBorder: 'rgba(255, 59, 48, 0.3)',

  // Fondos
  background: '#F2F2F7',
  cardBackground: '#FFFFFF',
  cardBackgroundGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceMuted: '#E5E5EA',
  /** Hoja inferior translúcida sobre el mapa. */
  sheetBackground: 'rgba(255, 255, 255, 0.94)',
  /** Barra de pestañas fija del mapa. */
  tabBarBackground: 'rgba(255, 255, 255, 0.98)',
  /** Botones flotantes sobre el mapa. */
  floatingControl: 'rgba(255, 255, 255, 0.92)',
  /** Velo oscuro detrás de un modal. */
  overlay: 'rgba(0, 0, 0, 0.5)',
  /** Asa de arrastre de la hoja inferior. */
  handle: '#C5C5C7',

  // Texto
  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  textTertiary: '#8E8E93',
  /** Texto sobre fondos de color (botones primarios): blanco en ambos modos. */
  textInverse: '#FFFFFF',

  // Mapa y marcadores
  markerUser: '#007AFF',
  markerFamily: '#34C759',
  markerRing: '#FFFFFF',

  // Bordes
  border: '#D1D1D6',
  borderSubtle: 'rgba(60, 60, 67, 0.12)',

  // Sombras
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowElevated: 'rgba(0, 0, 0, 0.16)',
};

export type ThemeColors = typeof LightColors;

export const DarkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryDark: '#409CFF',
  primaryMuted: 'rgba(10, 132, 255, 0.22)',
  primarySubtle: 'rgba(10, 132, 255, 0.16)',

  secondary: '#30D158',
  secondaryDark: '#30DB5B',
  secondaryMuted: 'rgba(48, 209, 88, 0.18)',

  warning: '#FF9F0A',
  warningMuted: 'rgba(255, 159, 10, 0.18)',
  warningText: '#FFB340',

  danger: '#FF453A',
  dangerDark: '#FF6961',
  dangerMuted: 'rgba(255, 69, 58, 0.18)',
  dangerBorder: 'rgba(255, 69, 58, 0.4)',

  background: '#000000',
  cardBackground: '#1C1C1E',
  cardBackgroundGlass: 'rgba(28, 28, 30, 0.85)',
  surfaceMuted: '#2C2C2E',
  sheetBackground: 'rgba(28, 28, 30, 0.96)',
  tabBarBackground: 'rgba(22, 22, 24, 0.98)',
  floatingControl: 'rgba(44, 44, 46, 0.94)',
  overlay: 'rgba(0, 0, 0, 0.65)',
  handle: '#5A5A5E',

  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',

  markerUser: '#0A84FF',
  markerFamily: '#30D158',
  markerRing: '#FFFFFF',

  border: '#38383A',
  borderSubtle: 'rgba(84, 84, 88, 0.6)',

  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowElevated: 'rgba(0, 0, 0, 0.5)',
};
