import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { BigButton } from '../../shared/presentation/components/BigButton';
import { Colors } from '../../shared/theme/colors';
import { Typography, Spacing } from '../../shared/theme/typography';

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <ShieldAlert size={40} color={Colors.warning} />
        </View>
        <Text style={styles.title}>Registro Restringido</Text>
        <Text style={styles.message}>
          El auto-registro público se encuentra deshabilitado. Para obtener acceso, solicita a tu Administrador de Familia o Super Administrador que cree tu cuenta.
        </Text>
        <BigButton
          title="Volver a Iniciar Sesión"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});
