import React, { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react-native';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { FormModal } from '../../../../shared/presentation/components/FormModal';
import { PASSWORD_HINT, validatePassword } from '../../../../shared/domain/validation';
import { useTheme } from '../../../../shared/theme/use-theme';

interface ResetPasswordModalProps {
  visible: boolean;
  /** Nombre de la persona, para el título. */
  personName: string;
  onSubmit: (newPassword: string) => Promise<string | null>;
  onClose: () => void;
}

/** Restablecer la contraseña de otra persona (no pide la anterior). */
export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  personName,
  onSubmit,
  onClose,
}) => {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPassword('');
    setConfirmation('');
    setError(null);
  }, [visible]);

  const handleSubmit = async () => {
    const validationError =
      validatePassword(password) ??
      (password !== confirmation ? 'Las contraseñas no coinciden.' : null);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const serverError = await onSubmit(password);
    setSubmitting(false);

    if (serverError) {
      setError(serverError);
    } else {
      onClose();
    }
  };

  return (
    <FormModal
      visible={visible}
      title={`Nueva contraseña para ${personName}`}
      icon={<KeyRound size={24} color={colors.primary} />}
      description="Se cerrará su sesión en todos sus teléfonos y tendrá que entrar con esta contraseña. Díselo en persona o por un canal de confianza."
      error={error}
      submitLabel="Restablecer contraseña"
      loading={submitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <CustomInput
        label="Nueva contraseña"
        placeholder={PASSWORD_HINT}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError(null);
        }}
        isPassword
      />
      <CustomInput
        label="Repite la contraseña"
        value={confirmation}
        onChangeText={(value) => {
          setConfirmation(value);
          setError(null);
        }}
        isPassword
      />
    </FormModal>
  );
};
