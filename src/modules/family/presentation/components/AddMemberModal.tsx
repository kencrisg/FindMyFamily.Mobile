import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, UserPlus } from 'lucide-react-native';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (phoneNumber: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onAdd,
  isLoading = false,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setError('');
    if (!phoneNumber.trim()) {
      setError('Ingresa el número de teléfono del familiar.');
      return;
    }

    const success = await onAdd(phoneNumber.trim());
    if (success) {
      setPhoneNumber('');
      onClose();
    } else {
      setError('No se pudo encontrar o agregar a este usuario.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheetContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <UserPlus size={24} color={Colors.primary} />
              <Text style={styles.title}>Invitar a Familiar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Ingresa el número de teléfono con el que tu familiar se registró en la app.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomInput
            label="Número de Teléfono"
            placeholder="Ej: +525512345678"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setError('');
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          <BigButton
            title="Agregar al Círculo"
            onPress={handleAdd}
            loading={isLoading}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: Spacing.borderRadiusLg,
    borderTopRightRadius: Spacing.borderRadiusLg,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    shadowColor: Colors.shadowElevated,
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
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    fontSize: 15,
  },
  errorText: {
    ...Typography.callout,
    color: Colors.danger,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
