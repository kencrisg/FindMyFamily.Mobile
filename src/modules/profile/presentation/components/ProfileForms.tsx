import React, { useEffect, useState } from 'react';
import { KeyRound, Pencil, Phone } from 'lucide-react-native';
import { CustomInput } from '../../../../shared/presentation/components/CustomInput';
import { FormModal } from '../../../../shared/presentation/components/FormModal';
import { useTheme } from '../../../../shared/theme/use-theme';
import {
  NAME_MAX_LENGTH,
  PASSWORD_HINT,
  validateName,
  validatePassword,
  validatePhone,
} from '../../../../shared/domain/validation';

/**
 * Estado común de un formulario del perfil: valores, error y envío. Se reinicia cada vez
 * que el formulario se abre, para no mostrar lo que se escribió la vez anterior.
 */
function useFormState<T extends Record<string, string>>(visible: boolean, initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setValues(initial);
      setError(null);
    }
    // `initial` se toma solo al abrir; incluirlo reiniciaría el formulario mientras se escribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const field = (key: keyof T) => ({
    value: values[key],
    onChangeText: (text: string) => {
      setValues((current) => ({ ...current, [key]: text }));
      setError(null);
    },
  });

  /** Valida, envía y cierra si todo fue bien. `send` devuelve el error del servidor o null. */
  const submit = async (
    validate: () => string | null,
    send: () => Promise<string | null>,
    onDone: () => void
  ) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    const serverError = await send();
    setSubmitting(false);
    if (serverError) {
      setError(serverError);
    } else {
      onDone();
    }
  };

  return { values, error, submitting, field, submit };
}

interface BaseProps {
  visible: boolean;
  onClose: () => void;
}

export const EditNameModal: React.FC<
  BaseProps & {
    firstName: string;
    lastName: string;
    onSubmit: (firstName: string, lastName: string) => Promise<string | null>;
  }
> = ({ visible, onClose, firstName, lastName, onSubmit }) => {
  const { colors } = useTheme();
  const form = useFormState(visible, { firstName, lastName });

  return (
    <FormModal
      visible={visible}
      title="Tu nombre"
      icon={<Pencil size={24} color={colors.primary} />}
      description="Así te verá tu familia en la app."
      error={form.error}
      submitLabel="Guardar"
      loading={form.submitting}
      onClose={onClose}
      onSubmit={() =>
        form.submit(
          () =>
            validateName(form.values.firstName, 'nombre') ??
            validateName(form.values.lastName, 'apellido'),
          () => onSubmit(form.values.firstName.trim(), form.values.lastName.trim()),
          onClose
        )
      }
    >
      <CustomInput label="Nombre" maxLength={NAME_MAX_LENGTH} autoCapitalize="words" {...form.field('firstName')} />
      <CustomInput label="Apellido" maxLength={NAME_MAX_LENGTH} autoCapitalize="words" {...form.field('lastName')} />
    </FormModal>
  );
};

export const ChangePhoneModal: React.FC<
  BaseProps & { onSubmit: (newPhone: string, password: string) => Promise<string | null> }
> = ({ visible, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const form = useFormState(visible, { phone: '', password: '' });

  return (
    <FormModal
      visible={visible}
      title="Cambiar teléfono"
      icon={<Phone size={24} color={colors.primary} />}
      description="Desde ahora iniciarás sesión con el número nuevo. Por seguridad, confirma con tu contraseña."
      error={form.error}
      submitLabel="Cambiar teléfono"
      loading={form.submitting}
      onClose={onClose}
      onSubmit={() =>
        form.submit(
          () =>
            validatePhone(form.values.phone) ??
            (form.values.password ? null : 'Escribe tu contraseña actual.'),
          () => onSubmit(form.values.phone.trim(), form.values.password),
          onClose
        )
      }
    >
      <CustomInput label="Teléfono nuevo" keyboardType="phone-pad" autoComplete="tel" {...form.field('phone')} />
      <CustomInput label="Contraseña actual" isPassword {...form.field('password')} />
    </FormModal>
  );
};

export const ChangePasswordModal: React.FC<
  BaseProps & { onSubmit: (current: string, next: string) => Promise<string | null> }
> = ({ visible, onClose, onSubmit }) => {
  const { colors } = useTheme();
  const form = useFormState(visible, { current: '', next: '', confirmation: '' });

  return (
    <FormModal
      visible={visible}
      title="Cambiar contraseña"
      icon={<KeyRound size={24} color={colors.primary} />}
      description="Se cerrará tu sesión en tus otros teléfonos. En este seguirás dentro."
      error={form.error}
      submitLabel="Cambiar contraseña"
      loading={form.submitting}
      onClose={onClose}
      onSubmit={() =>
        form.submit(
          () =>
            (form.values.current ? null : 'Escribe tu contraseña actual.') ??
            validatePassword(form.values.next) ??
            (form.values.next !== form.values.confirmation ? 'Las contraseñas nuevas no coinciden.' : null) ??
            (form.values.next === form.values.current
              ? 'La contraseña nueva debe ser distinta de la actual.'
              : null),
          () => onSubmit(form.values.current, form.values.next),
          onClose
        )
      }
    >
      <CustomInput label="Contraseña actual" isPassword {...form.field('current')} />
      <CustomInput label="Contraseña nueva" placeholder={PASSWORD_HINT} isPassword {...form.field('next')} />
      <CustomInput label="Repite la contraseña nueva" isPassword {...form.field('confirmation')} />
    </FormModal>
  );
};
