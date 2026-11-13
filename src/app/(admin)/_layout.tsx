import { Tabs } from 'expo-router/js-tabs';
import { CircleUser, Users, UsersRound } from 'lucide-react-native';
import { useTheme } from '../../shared/theme/use-theme';

/**
 * Panel del Administrador de Sistema. Solo administración: familias, usuarios y su propia
 * cuenta. No hay mapa, a propósito: el super admin no ve ubicaciones.
 */
export default function AdminLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Cada pestaña tiene su propia pila con cabecera: la de la pestaña sobra. */}
      <Tabs.Screen
        name="families"
        options={{
          title: 'Familias',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Mi cuenta',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <CircleUser color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
