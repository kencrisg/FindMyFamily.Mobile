import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { makeStyles, useTheme } from '../../theme/use-theme';
import { Typography, Spacing } from '../../theme/typography';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  ...rest
}) => {
  const styles = useStyles();
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          !!error && styles.errorWrapper,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          // En los campos de contraseña se desactivan el autocorrector y el diccionario:
          // de lo contrario el teclado puede aprender y sugerir lo que se escribió,
          // sobre todo mientras el usuario usa el ojo para mostrar la contraseña.
          autoCorrect={isPassword ? false : rest.autoCorrect}
          spellCheck={isPassword ? false : rest.spellCheck}
          textContentType={isPassword ? 'password' : rest.textContentType}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={22} color={colors.textSecondary} />
            ) : (
              <Eye size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const useStyles = makeStyles((colors) => ({
  container: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  label: {
    ...Typography.subhead,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 15,
  },
  inputWrapper: {
    height: Spacing.inputHeight,
    backgroundColor: colors.cardBackground,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  focusedWrapper: {
    borderColor: colors.primary,
  },
  errorWrapper: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.body,
    fontSize: 17,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: colors.danger,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
}));
