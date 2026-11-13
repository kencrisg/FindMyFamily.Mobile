import { Stack } from 'expo-router';
import { useTheme } from '../../../shared/theme/use-theme';

/** Pila de "Mi cuenta": la configuración se abre encima, con flecha para volver. */
export default function AdminAccountLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mi cuenta' }} />
      <Stack.Screen name="settings" options={{ title: 'Configuración de la app' }} />
    </Stack>
  );
}
