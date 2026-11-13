import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { BigButton } from './BigButton';
import { makeStyles, useTheme } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface EmptyStateProps {
  /** Muestra un indicador de carga en lugar del mensaje. */
  loading?: boolean;
  title: string;
  message?: string;
  /** Si hay error, se muestra en rojo con un botón de reintento. */
  error?: string | null;
  onRetry?: () => void;
}

/** Estado vacío, de carga o de error de una lista. */
export const EmptyState: React.FC<EmptyStateProps> = ({ loading, title, message, error, onRetry }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{error ? 'Algo salió mal' : title}</Text>
      {error ? (
        <Text style={[styles.message, styles.error]}>{error}</Text>
      ) : message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
      {error && onRetry ? (
        <BigButton title="Reintentar" onPress={onRetry} variant="ghost" style={styles.retry} />
      ) : null}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Typography.headline,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...Typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  error: {
    color: colors.danger,
  },
  retry: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
}));
