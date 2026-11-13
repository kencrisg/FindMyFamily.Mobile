import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { BigButton } from '../../shared/presentation/components/BigButton';
import { makeStyles, useTheme } from '../../shared/theme/use-theme';
import { Typography, Spacing } from '../../shared/theme/typography';

export default function RegisterRoute() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <ShieldAlert size={40} color={colors.warning} />
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

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title2,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
}));
