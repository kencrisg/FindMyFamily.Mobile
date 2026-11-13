import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { makeStyles } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface SegmentedControlProps<T extends string> {
  label?: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

/** Selector de una opción entre pocas (p. ej. rol: Miembro / Administrador). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.track}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.segment, selected && styles.selected]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.subhead,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: Spacing.borderRadiusSm,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Spacing.borderRadiusSm - 2,
  },
  selected: {
    backgroundColor: colors.cardBackground,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    ...Typography.subhead,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.textPrimary,
  },
}));
