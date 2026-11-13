import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { makeStyles, useTheme } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Iniciales para el avatar circular. Se ignora si se pasa `icon`. */
  initials?: string;
  icon?: React.ReactNode;
  /** Elemento a la derecha (una etiqueta, un botón...). */
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Atenúa la fila, p. ej. para un elemento que no se puede gestionar. */
  muted?: boolean;
  isLast?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  initials,
  icon,
  trailing,
  onPress,
  muted = false,
  isLast = false,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const content = (
    <View style={[styles.row, !isLast && styles.divider, muted && styles.muted]}>
      {icon ? (
        <View style={styles.iconCircle}>{icon}</View>
      ) : initials ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      ) : null}

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing}
      {onPress ? <ChevronRight size={18} color={colors.textTertiary} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} accessibilityRole="button">
      {content}
    </TouchableOpacity>
  );
};

/** Iniciales a partir de nombre y apellido: "Maria Castro" → "MC". */
export const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 64,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  muted: {
    opacity: 0.55,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.headline,
    color: colors.primary,
    fontWeight: '700',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
  },
  title: {
    ...Typography.headline,
    color: colors.textPrimary,
  },
  subtitle: {
    ...Typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
}));
