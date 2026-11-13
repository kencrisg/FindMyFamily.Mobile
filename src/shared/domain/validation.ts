/**
 * Validaciones de formulario que replican las reglas del backend (PasswordPolicy,
 * PhoneNumber y PersonName). El backend sigue siendo quien decide: esto solo evita un viaje
 * al servidor para errores evidentes y da el mensaje en el momento.
 *
 * Si cambia una regla en el backend, hay que cambiarla también aquí.
 */

export const NAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Devuelve el mensaje de error, o null si el valor es válido. */
export const validateName = (value: string, field: 'nombre' | 'apellido'): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return `El ${field} es obligatorio.`;
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `El ${field} no puede exceder ${NAME_MAX_LENGTH} caracteres.`;
  }
  return null;
};

export const validatePhone = (value: string): string | null => {
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (!cleaned) return 'El número de teléfono es obligatorio.';
  if (!/^\+?[0-9]{7,19}$/.test(cleaned)) {
    return 'El número de teléfono no tiene un formato válido.';
  }
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return 'La contraseña es obligatoria.';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  // \p{L} y \p{Nd} equivalen a char.IsLetter y char.IsDigit del backend.
  if (!/\p{L}/u.test(value) || !/\p{Nd}/u.test(value)) {
    return 'La contraseña debe combinar al menos una letra y un número.';
  }
  return null;
};

/** Texto de ayuda que se muestra bajo los campos de contraseña nueva. */
export const PASSWORD_HINT = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres, con al menos una letra y un número.`;
