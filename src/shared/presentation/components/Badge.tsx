import React from 'react';
import { Text, View } from 'react-native';
import { makeStyles, useTheme } from '../../theme/use-theme';
import { ThemeColors } from '../../theme/colors';
import { Typography, Spacing } from '../../theme/typography';

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

const tones = (colors: ThemeColors): Record<BadgeTone, { background: string; text: string }> => ({
  primary: { background: colors.primaryMuted, text: colors.primary },
  neutral: { background: colors.surfaceMuted, text: colors.textSecondary },
  success: { background: colors.secondaryMuted, text: colors.secondary },
  warning: { background: colors.warningMuted, text: colors.warningText },
  danger: { background: colors.dangerMuted, text: colors.danger },
});

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral' }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const { background, text } = tones(colors)[tone];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Spacing.borderRadiusPill,
  },
  text: {
    ...Typography.caption,
    fontWeight: '700',
  },
}));
