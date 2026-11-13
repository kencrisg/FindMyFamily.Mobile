import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Family } from '../../../family/domain/entities/family.types';
import { makeStyles, useTheme } from '../../../../shared/theme/use-theme';
import { Spacing, Typography } from '../../../../shared/theme/typography';

interface FamilyPickerProps {
  families: Family[] | null;
  selectedId: string | null;
  onSelect: (familyId: string) => void;
}

/**
 * Elección de familia al crear un usuario. Es una lista y no un desplegable porque son
 * pocas familias y así se ven todas de un vistazo.
 */
export const FamilyPicker: React.FC<FamilyPickerProps> = ({ families, selectedId, onSelect }) => {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Familia</Text>
      {families === null ? (
        <Text style={styles.hint}>Cargando familias…</Text>
      ) : families.length === 0 ? (
        <Text style={styles.hint}>
          No hay ninguna familia. Crea una primero en la pestaña Familias: todo usuario debe
          pertenecer a una.
        </Text>
      ) : (
        <View style={styles.list}>
          {families.map((family, index) => {
            const selected = family.id === selectedId;
            return (
              <TouchableOpacity
                key={family.id}
                style={[styles.option, index < families.length - 1 && styles.divider]}
                onPress={() => onSelect(family.id)}
                activeOpacity={0.6}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.optionText, selected && styles.selectedText]}>{family.name}</Text>
                {selected ? <Check size={20} color={colors.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

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
  hint: {
    ...Typography.footnote,
    color: colors.textSecondary,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Spacing.borderRadiusSm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: Spacing.md,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...Typography.body,
    color: colors.textPrimary,
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600',
  },
}));
