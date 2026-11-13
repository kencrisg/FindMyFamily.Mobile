import { useEffect, useState } from 'react';
import { LocationCoordinate } from '../../domain/entities/location.types';
import { MemberRequestState } from '../../application/location.store';
import { formatRelativeTime } from '../../../../shared/presentation/utils/format-relative-time';

/** Una ubicación de hace menos de esto se muestra como "Ahora". */
const FRESH_LOCATION_MS = 2 * 60_000;

export type StatusTone = 'live' | 'warning' | 'muted' | 'active';

export interface MemberLocationStatus {
  /** Línea principal del estado, con su color. */
  text: string;
  tone: StatusTone;
  /** Línea secundaria en gris (p. ej. "Última ubicación hace 1 min"). */
  detail?: string;
}

export const isFreshLocation = (location: LocationCoordinate | null | undefined, now: number) =>
  !!location && now - new Date(location.capturedAt).getTime() < FRESH_LOCATION_MS;

/**
 * Qué decir de la ubicación de un familiar, al estilo de "Buscar" del iPhone. Lo usan la
 * tarjeta del familiar y la lista, para que nunca se contradigan.
 */
export function describeMemberLocation(
  location: LocationCoordinate | null | undefined,
  request: MemberRequestState | undefined,
  now: number
): MemberLocationStatus {
  const lastSeen = location ? `Última ubicación ${formatRelativeTime(location.capturedAt)}` : undefined;

  switch (request?.status) {
    case 'waiting':
      return { text: 'Localizando…', tone: 'active', detail: lastSeen };
    case 'sharing-disabled':
      return { text: 'Ubicación desactivada', tone: 'warning', detail: 'No comparte su ubicación' };
    case 'unavailable':
      return {
        text: 'Fuera de cobertura',
        tone: 'warning',
        detail: lastSeen ?? 'Sin ubicaciones registradas',
      };
  }

  if (!location) return { text: 'Sin ubicaciones registradas', tone: 'muted' };
  if (isFreshLocation(location, now)) return { text: 'Ahora', tone: 'live' };
  const relative = formatRelativeTime(location.capturedAt);
  return { text: relative.charAt(0).toUpperCase() + relative.slice(1), tone: 'muted' };
}

/**
 * Hora actual que se renueva sola. Sin esto, "Ahora" seguiría en pantalla diez minutos
 * después, porque nada más provoca que se vuelva a pintar.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
