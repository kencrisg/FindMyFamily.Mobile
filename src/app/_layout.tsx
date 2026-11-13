import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { selectIsSuperAdmin, useAuthStore } from '../modules/auth/application/auth.store';

// Importado por su efecto secundario: registra la tarea que atiende el Silent Push.
// `TaskManager.defineTask` debe ejecutarse al cargar el bundle, porque cuando el sistema
// despierta la app en segundo plano espera encontrar la tarea ya definida.
import '../modules/location/infrastructure/location-request.task';
import { ConnectionErrorView } from '../modules/auth/presentation/components/ConnectionErrorView';
import { makeStyles, useTheme } from '../shared/theme/use-theme';
import { useThemeStore } from '../shared/theme/theme.store';

export default function RootLayout() {
  const styles = useStyles();
  const { colors, isDark } = useTheme();
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const initialize = useAuthStore((state) => state.initialize);
  const isSuperAdmin = useAuthStore(selectIsSuperAdmin);

  useEffect(() => {
    // La apariencia elegida (claro, oscuro o la del teléfono) se aplica al arrancar.
    void hydrateTheme();
    initialize();
  }, [hydrateTheme, initialize]);

  // Tema de la navegación: cabeceras, barras de pestañas y fondos de las transiciones
  // toman estos colores sin que cada pantalla tenga que repetirlos.
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.textPrimary,
        border: colors.border,
      },
    };
  }, [isDark, colors]);

  const isLoading = status === 'loading' || status === 'idle';
  const isOffline = status === 'offline';
  const isAuthenticated = status === 'authenticated';

  // El navegador se renderiza SIEMPRE, también mientras se comprueba la sesión. Antes este
  // layout devolvía solo el spinner en ese tiempo, así que el router aún no existía cuando
  // un useEffect llamaba a router.replace(): React avisaba de una actualización de estado
  // sobre un componente sin montar. Ahora la carga es una capa por encima del navegador.
  //
  // Las redirecciones las resuelve Stack.Protected: cuando cambia `status`, Expo Router saca
  // al usuario del grupo que deja de estar permitido y lo lleva a la ruta inicial (index).
  //
  // Tres grupos excluyentes:
  //   (auth)  sin sesión.
  //   (main)  familiares: el mapa y la gestión de su familia si la administran.
  //   (admin) super admin: solo administración. No ve mapas ni ubicaciones; si quiere usar
  //           la app como familiar, necesita una cuenta normal como cualquiera.
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Botones del sistema (◀ ● ■) a juego con el tema. Requiere `enforceContrast: false`
          en app.json: si no, Android pinta encima su propia franja clara. */}
      <NavigationBar style={isDark ? 'dark' : 'light'} />
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Protected guard={isAuthenticated && !isSuperAdmin}>
            <Stack.Screen name="(main)" />
          </Stack.Protected>
          <Stack.Protected guard={isAuthenticated && isSuperAdmin}>
            <Stack.Screen name="(admin)" />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {isOffline && <ConnectionErrorView onRetry={initialize} />}
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
}));
