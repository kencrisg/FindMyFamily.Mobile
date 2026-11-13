import { Stack } from 'expo-router';
import { useTheme } from '../../shared/theme/use-theme';

export default function MainLayout() {
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
      {/* El mapa ocupa toda la pantalla y lleva su propia hoja inferior: sin cabecera. */}
      <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="profile" options={{ title: 'Mi perfil' }} />
      <Stack.Screen name="settings" options={{ title: 'Configuración de la app' }} />
      <Stack.Screen name="family/[id]" options={{ title: 'Administrar familia' }} />
    </Stack>
  );
}
