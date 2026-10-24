/**
 * Formato relativo de una marca temporal: "hace 40 min".
 *
 * Es la pieza central de la pantalla cuando un familiar está fuera de línea: en lugar de
 * una hora absoluta que obliga a hacer la cuenta mental, se dice cuánto tiempo pasó desde
 * su última ubicación válida. Pasadas las 24 h deja de ser útil en relativo ("hace 73 h"
 * no dice nada) y se muestra la fecha con la hora.
 *
 * Todas las marcas llegan en UTC con sufijo 'Z'; `new Date` las convierte a la zona del
 * dispositivo, que es lo que el usuario espera leer.
 */

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const horaCorta = (fecha: Date) =>
  fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatRelativeTime = (timestamp?: string | null): string => {
  if (!timestamp) return 'Sin ubicación reciente';

  const fecha = new Date(timestamp);
  if (Number.isNaN(fecha.getTime())) return 'Sin ubicación reciente';

  const diferencia = Date.now() - fecha.getTime();

  // Una marca ligeramente futura (desajuste de reloj entre teléfono y servidor) no debe
  // producir "hace -2 min".
  if (diferencia < MINUTO) return 'hace unos segundos';

  if (diferencia < HORA) {
    const minutos = Math.floor(diferencia / MINUTO);
    return `hace ${minutos} min`;
  }

  if (diferencia < DIA) {
    const horas = Math.floor(diferencia / HORA);
    return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
  }

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  if (fecha.toDateString() === ayer.toDateString()) {
    return `ayer a las ${horaCorta(fecha)}`;
  }

  return `el ${fecha.toLocaleDateString()} a las ${horaCorta(fecha)}`;
};

/** Variante con mayúscula inicial, para cuando abre una frase. */
export const formatRelativeTimeCapitalized = (timestamp?: string | null): string => {
  const texto = formatRelativeTime(timestamp);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};
