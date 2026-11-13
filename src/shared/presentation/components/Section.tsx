import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface SectionProps {
  title?: string;
  /** Texto explicativo bajo la tarjeta. */
  footer?: string;
  children: React.ReactNode;
}

/** Tarjeta agrupada con título, al estilo de los ajustes de iOS. */
export const Section: React.FC<SectionProps> = ({ title, footer, children }) => {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.footnote,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: Spacing.borderRadiusMd,
    overflow: 'hidden',
  },
  footer: {
    ...Typography.footnote,
    color: colors.textSecondary,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
}));
