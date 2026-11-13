import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing } from '../../theme/typography';

interface HeaderIconButtonProps {
  icon: React.ReactNode;
  /** Texto para lectores de pantalla: el botón solo muestra un icono. */
  accessibilityLabel: string;
  onPress: () => void;
}

/** Botón de icono para la cabecera de una pantalla (p. ej. "+" para crear). */
export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({ icon, accessibilityLabel, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.button}
    activeOpacity={0.6}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    hitSlop={8}
  >
    {icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
