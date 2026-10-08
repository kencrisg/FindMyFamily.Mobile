import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '../../application/auth.store';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';

export const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { register, status, error, clearError } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    setValidationError('');
    clearError();

    if (!firstName.trim()) {
      setValidationError('Por favor ingresa tu nombre');
      return;
    }
    if (!lastName.trim()) {
      setValidationError('Por favor ingresa tus apellidos');
      return;
    }
    if (!phoneNumber.trim()) {
      setValidationError('Por favor ingresa tu número de teléfono');
      return;
    }
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const success = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password.trim(),
      deviceModel: Platform.OS === 'ios' ? 'Apple iPhone' : 'Android Device',
    });

    if (success) {
      router.replace('/(main)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Back Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <UserPlus size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Crea tu perfil para formar o unirte a tu círculo familiar.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error || validationError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error || validationError}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Nombre"
              placeholder="Ej: Daniel"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                clearError();
              }}
              autoCapitalize="words"
            />

            <CustomInput
              label="Apellidos"
              placeholder="Ej: García"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                clearError();
              }}
              autoCapitalize="words"
            />

            <CustomInput
              label="Número de Teléfono"
              placeholder="Ej: +525512345678"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                clearError();
              }}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            <CustomInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              isPassword
            />

            <BigButton
              title="Registrarme"
              onPress={handleRegister}
              loading={status === 'loading'}
              style={styles.registerButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  topNav: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorBannerText: {
    ...Typography.callout,
    color: Colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButton: {
    marginTop: Spacing.md,
  },
});
