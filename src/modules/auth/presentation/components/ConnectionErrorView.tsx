import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

interface ConnectionErrorViewProps {
  onRetry: () => void;
}

/**
 * Se muestra cuando hay una sesión guardada pero no se pudo validar con el servidor.
 * La sesión NO se ha perdido: basta con reintentar, sin volver a escribir la contraseña.
 */
export const ConnectionErrorView: React.FC<ConnectionErrorViewProps> = ({ onRetry }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <WifiOff size={40} color={colors.warning} />
        </View>

        <Text style={styles.title}>No se pudo conectar</Text>
        <Text style={styles.message}>
          Revisa que tengas internet. Si es la primera vez que abres la app hoy, el servidor
          puede tardar hasta un minuto en despertar.
        </Text>
        <Text style={styles.hint}>Tu sesión sigue guardada, no necesitas volver a entrar.</Text>

        <BigButton title="Reintentar" onPress={onRetry} style={styles.button} />
      </View>
    </SafeAreaView>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  hint: {
    ...Typography.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  button: {
    alignSelf: 'stretch',
  },
}));
