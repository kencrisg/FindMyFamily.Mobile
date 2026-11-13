import axios from 'axios';

/**
 * Convierte un error de la API en un mensaje para el usuario.
 *
 * El backend responde siempre `{ error, code, message }` con `message` ya en español y
 * pensado para mostrarse, así que se prefiere ese texto. Solo si no existe (sin red, o una
 * respuesta inesperada) se usa el mensaje de respaldo de quien llama.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
  }

  if (error.response.status === 429) {
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
  }

  const data = error.response.data as { message?: unknown } | undefined;
  return typeof data?.message === 'string' && data.message.trim() ? data.message : fallback;
};

/**
 * Ejecuta una operación contra la API y devuelve el mensaje de error, o null si fue bien.
 * Los formularios lo usan para mostrar el error del servidor sin repetir try/catch.
 */
export const runMutation = async (
  action: () => Promise<unknown>,
  fallback: string
): Promise<string | null> => {
  try {
    await action();
    return null;
  } catch (error) {
    return getApiErrorMessage(error, fallback);
  }
};
