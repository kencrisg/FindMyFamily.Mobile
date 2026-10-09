import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, UserPlus } from 'lucide-react-native';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';

interface AddMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateMember: (data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
  }) => Promise<boolean>;
  isLoading?: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onCreateMember,
  isLoading = false,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (!firstName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    if (!lastName.trim()) {
      setError('El apellido es obligatorio.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('El número de teléfono es obligatorio.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await onCreateMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password.trim(),
    });

    if (success) {
      resetForm();
      onClose();
    } else {
      setError('No se pudo crear la cuenta del familiar. Verifica los datos.');
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
              <Text style={styles.title}>Registrar Familiar</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Crea la cuenta de acceso para tu familiar dentro de tu grupo. Podrá iniciar sesión en la app con este teléfono y contraseña.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <CustomInput
              label="Nombre"
              placeholder="Ej: Juan"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setError('');
              }}
            />

            <CustomInput
              label="Apellido"
              placeholder="Ej: Pérez"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setError('');
              }}
            />

            <CustomInput
              label="Número de Teléfono"
              placeholder="Ej: 0981234567"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setError('');
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            <CustomInput
              label="Contraseña Temporal"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              isPassword
            />

            <BigButton
              title="Crear y Agregar a la Familia"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </ScrollView>
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
    maxHeight: '85%',
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
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  errorText: {
    ...Typography.callout,
    color: Colors.danger,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
});
