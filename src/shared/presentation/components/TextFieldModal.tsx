import React, { useEffect, useState } from 'react';
import { CustomInput } from './CustomInput';
import { FormModal } from './FormModal';

interface TextFieldModalProps {
  visible: boolean;
  title: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  submitLabel: string;
  maxLength?: number;
  icon?: React.ReactNode;
  /** Devuelve el mensaje de error del servidor, o null si fue bien. */
  onSubmit: (value: string) => Promise<string | null>;
  onClose: () => void;
}

/**
 * Formulario de un solo campo de texto (p. ej. el nombre de una familia). Sustituye a
 * Alert.prompt, que solo existe en iOS.
 */
export const TextFieldModal: React.FC<TextFieldModalProps> = ({
  visible,
  title,
  label,
  placeholder,
  initialValue = '',
  submitLabel,
  maxLength,
  icon,
  onSubmit,
  onClose,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue);
    setError(null);
  }, [visible, initialValue]);

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError(`${label} es obligatorio.`);
      return;
    }

    setSubmitting(true);
    const serverError = await onSubmit(value.trim());
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
      title={title}
      icon={icon}
      error={error}
      submitLabel={submitLabel}
      loading={submitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <CustomInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setError(null);
        }}
        maxLength={maxLength}
        autoCapitalize="words"
        autoFocus
      />
    </FormModal>
  );
};
