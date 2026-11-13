import React from 'react';
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BigButton } from './BigButton';
import { makeStyles, useTheme } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface FormModalProps {
  visible: boolean;
  title: string;
  icon?: React.ReactNode;
  description?: string;
  /** Error a mostrar sobre los campos (validación local o mensaje del servidor). */
  error?: string | null;
  submitLabel: string;
  submitVariant?: 'primary' | 'danger';
  loading?: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

/**
 * Hoja inferior con un formulario. Base común de todos los formularios de gestión
 * (crear familiar, editar datos, restablecer contraseña...), para que se vean y se
 * comporten igual: el error arriba, el botón de enviar al final.
 *
 * Mientras `loading` es true no se puede cerrar: si el usuario lo cierra a mitad de una
 * petición, el resultado llega a un formulario que ya no ve.
 */
export const FormModal: React.FC<FormModalProps> = ({
  visible,
  title,
  icon,
  description,
  error,
  submitLabel,
  submitVariant = 'primary',
  loading = false,
  onSubmit,
  onClose,
  children,
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  // La app se dibuja de borde a borde: sin este margen, la barra de navegación de Android
  // tapaba el botón de enviar.
  const insets = useSafeAreaInsets();

  const close = () => {
    if (!loading) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {icon}
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={close}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {description ? <Text style={styles.description}>{description}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
            <BigButton
              title={submitLabel}
              onPress={onSubmit}
              loading={loading}
              variant={submitVariant}
              style={styles.submit}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    padding: Spacing.xl,
    maxHeight: '90%',
    shadowColor: colors.shadowElevated,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title3,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...Typography.body,
    color: colors.textSecondary,
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  error: {
    ...Typography.callout,
    color: colors.danger,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  submit: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
}));
