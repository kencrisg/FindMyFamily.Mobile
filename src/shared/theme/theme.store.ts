import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

/** Preferencia de apariencia. `system` sigue el modo claro u oscuro del teléfono. */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Clave propia, distinta de las de la sesión: `SecureStorageService.clearAll()` solo borra
 * las de la sesión, así que la apariencia elegida se conserva al cerrar sesión. Es una
 * preferencia del teléfono, no de la cuenta.
 */
const PREFERENCE_KEY = 'fmf_theme_preference';

const isPreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Aplica la preferencia a nivel de sistema. Con `Appearance.setColorScheme` no solo cambia
 * lo que devuelve `useColorScheme()`: también los avisos y diálogos nativos de Android, que
 * de otro modo seguirían en claro dentro de una app en oscuro.
 */
const apply = (preference: ThemePreference) =>
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);

interface ThemeState {
  preference: ThemePreference;
  /** Lee la preferencia guardada al arrancar la app. */
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(PREFERENCE_KEY);
      if (isPreference(stored)) {
        set({ preference: stored });
        apply(stored);
      }
    } catch {
      // Sin preferencia legible se queda en `system`: la app sigue al teléfono.
    }
  },

  setPreference: async (preference) => {
    set({ preference });
    apply(preference);
    try {
      await SecureStore.setItemAsync(PREFERENCE_KEY, preference);
    } catch {
      // Si no se puede guardar, el cambio vale para esta sesión de la app.
    }
  },
}));
