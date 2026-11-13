import { StyleSheet, useColorScheme } from 'react-native';
import { DarkColors, LightColors, ThemeColors } from './colors';

/**
 * Paleta activa. `useColorScheme()` ya refleja la preferencia del usuario porque el store
 * del tema la aplica con `Appearance.setColorScheme`; con "Predeterminado", sigue al teléfono.
 */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? DarkColors : LightColors, isDark };
}

/**
 * Hojas de estilo que dependen del tema. Sustituye a `StyleSheet.create` en los componentes:
 *
 *   const useStyles = makeStyles((colors) => ({ title: { color: colors.textPrimary } }));
 *   // dentro del componente:
 *   const styles = useStyles();
 *
 * Cada paleta se procesa una sola vez y se reutiliza, así que cambiar de modo no recrea
 * los estilos en cada render.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: ThemeColors) => T) {
  const cache = new Map<ThemeColors, T>();

  return function useStyles(): T {
    const { colors } = useTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}
