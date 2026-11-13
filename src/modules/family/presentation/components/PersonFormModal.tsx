import React, { useEffect, useState } from 'react';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { FormModal } from '../../../../shared/presentation/components/FormModal';
import {
  NAME_MAX_LENGTH,
  PASSWORD_HINT,
  validateName,
  validatePassword,
  validatePhone,
} from '../../../../shared/domain/validation';

export interface PersonFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  /** Solo al crear. */
  password?: string;
}

interface PersonFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  title: string;
  description?: string;
  submitLabel: string;
  icon?: React.ReactNode;
  initialValues?: Partial<PersonFormValues>;
  /** Devuelve el mensaje de error del servidor, o null si fue bien (y entonces se cierra). */
  onSubmit: (values: PersonFormValues) => Promise<string | null>;
  onClose: () => void;
  /** Campos extra bajo los comunes (p. ej. familia y rol al crear desde el panel de plataforma). */
  children?: React.ReactNode;
}

/**
 * Formulario de los datos de una persona. Lo usan el admin de familia (crear y editar
 * miembros) y el super admin (crear y editar usuarios). Valida lo mismo que el backend
 * antes de enviar, y si el servidor rechaza algo (p. ej. un teléfono ya registrado)
 * muestra su mensaje tal cual.
 */
export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  visible,
  mode,
  title,
  description,
  submitLabel,
  icon,
  initialValues,
  onSubmit,
  onClose,
  children,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Se rellena cada vez que se abre: si no, al editar a otro miembro aparecerían los datos
  // del anterior.
  useEffect(() => {
    if (!visible) return;
    setFirstName(initialValues?.firstName ?? '');
    setLastName(initialValues?.lastName ?? '');
    setPhoneNumber(initialValues?.phoneNumber ?? '');
    setPassword('');
    setError(null);
  }, [visible, initialValues?.firstName, initialValues?.lastName, initialValues?.phoneNumber]);

  const handleSubmit = async () => {
    const validationError =
      validateName(firstName, 'nombre') ??
      validateName(lastName, 'apellido') ??
      validatePhone(phoneNumber) ??
      (mode === 'create' ? validatePassword(password) : null);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    const serverError = await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      ...(mode === 'create' ? { password } : {}),
    });
    setSubmitting(false);

    if (serverError) {
      setError(serverError);
    } else {
      onClose();
    }
  };

  const clearErrorAnd = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError(null);
  };

  return (
    <FormModal
      visible={visible}
      title={title}
      icon={icon}
      description={description}
      error={error}
      submitLabel={submitLabel}
      loading={submitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <CustomInput
        label="Nombre"
        placeholder="Ej: Juan"
        value={firstName}
        onChangeText={clearErrorAnd(setFirstName)}
        maxLength={NAME_MAX_LENGTH}
        autoCapitalize="words"
      />
      <CustomInput
        label="Apellido"
        placeholder="Ej: Pérez"
        value={lastName}
        onChangeText={clearErrorAnd(setLastName)}
        maxLength={NAME_MAX_LENGTH}
        autoCapitalize="words"
      />
      <CustomInput
        label="Número de teléfono"
        placeholder="Ej: 0981234567"
        value={phoneNumber}
        onChangeText={clearErrorAnd(setPhoneNumber)}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      {mode === 'create' ? (
        <CustomInput
          label="Contraseña inicial"
          placeholder={PASSWORD_HINT}
          value={password}
          onChangeText={clearErrorAnd(setPassword)}
          isPassword
        />
      ) : null}
      {children}
    </FormModal>
  );
};
