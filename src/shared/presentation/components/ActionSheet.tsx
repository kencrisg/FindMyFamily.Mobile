import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

export interface ActionSheetAction {
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
}

/**
 * Lista de acciones sobre un elemento. Sustituye a Alert con botones: en Android un Alert
 * admite como mucho tres, y aquí hay elementos con hasta cuatro acciones.
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({ visible, title, subtitle, actions, onClose }) => {
  const styles = useStyles();
  // La app se dibuja de borde a borde: sin este margen, la barra de navegación de Android
  // tapaba el botón Cancelar.
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.sm }]}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.action}
              activeOpacity={0.6}
              accessibilityRole="button"
              onPress={() => {
                // Se cierra antes de actuar porque la acción suele abrir otro modal. iOS no
                // presenta un modal mientras otro se está cerrando, así que allí se espera a
                // que termine la animación; en Android no hace falta.
                onClose();
                setTimeout(action.onPress, Platform.OS === 'ios' ? 350 : 0);
              }}
            >
              {action.icon}
              <Text style={[styles.actionText, action.destructive && styles.destructive]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancel} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = makeStyles((colors) => ({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: Spacing.borderRadiusLg,
    borderTopRightRadius: Spacing.borderRadiusLg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 54,
    paddingHorizontal: Spacing.sm,
  },
  actionText: {
    ...Typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  destructive: {
    color: colors.danger,
  },
  cancel: {
    marginTop: Spacing.sm,
    minHeight: 52,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    ...Typography.headline,
    color: colors.textPrimary,
  },
}));
