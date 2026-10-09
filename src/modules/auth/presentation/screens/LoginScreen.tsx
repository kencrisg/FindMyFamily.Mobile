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
import { ShieldCheck, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../application/auth.store';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { BigButton } from '../../../../shared/presentation/components/BigButton';
import { Colors } from '../../../../shared/theme/colors';
import { Typography, Spacing } from '../../../../shared/theme/typography';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, status, error, clearError } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleLogin = async () => {
    setValidationError('');
    clearError();

    if (!phoneNumber.trim()) {
      setValidationError('Por favor ingresa tu número de teléfono');
      return;
    }
    if (!password.trim()) {
      setValidationError('Por favor ingresa tu contraseña');
      return;
    }

    const success = await login({
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MapPin size={36} color={Colors.primary} />
            </View>
            <Text style={styles.title}>FindMyFamily</Text>
            <Text style={styles.subtitle}>
              Conecta y localiza a tus familiares de forma privada y segura.
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
              placeholder="Tu contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError();
              }}
              isPassword
            />

            <BigButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={status === 'loading'}
              style={styles.loginButton}
            />

            <View style={styles.securityBadge}>
              <ShieldCheck size={18} color={Colors.secondary} />
              <Text style={styles.securityText}>
                Tu ubicación sólo es visible para tu círculo familiar.
              </Text>
            </View>
          </View>

          {/* Footer Notice */}
          <View style={styles.footer}>
            <Text style={styles.footerNoticeText}>
              Acceso restringido. Tu cuenta debe ser creada por el Administrador de tu familia o de la plataforma.
            </Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
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
  loginButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  securityText: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  footerNoticeText: {
    ...Typography.footnote,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },
});
