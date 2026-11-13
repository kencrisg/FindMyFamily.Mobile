import { useEffect, useState } from 'react';
import { reverseGeocode } from '../../infrastructure/reverse-geocoding.service';

/**
 * Nombre legible de un sitio a partir de sus coordenadas: "Centro, Ciudad de México".
 *
 * Cada sitio se consulta una sola vez: el resultado se guarda por coordenada redondeada a
 * ~11 m. Lo exige la política de uso del servicio, y evita repetir la consulta cada vez que
 * se pinta la lista.
 */

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();

const keyOf = (latitude: number, longitude: number) => `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

function resolvePlace(key: string, latitude: number, longitude: number): Promise<string | null> {
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const request = reverseGeocode(latitude, longitude)
    .then((place) => {
      cache.set(key, place);
      return place;
    })
    // Un fallo (sin red, límite superado) no se guarda: se reintentará la próxima vez.
    .catch(() => null)
    .finally(() => pending.delete(key));

  pending.set(key, request);
  return request;
}

export function usePlaceName(location?: { latitude: number; longitude: number } | null): string | null {
  const key = location ? keyOf(location.latitude, location.longitude) : null;
  const [place, setPlace] = useState<string | null>(key ? (cache.get(key) ?? null) : null);

  useEffect(() => {
    if (!key || !location) {
      setPlace(null);
      return;
    }
    if (cache.has(key)) {
      setPlace(cache.get(key) ?? null);
      return;
    }

    let cancelled = false;
    void resolvePlace(key, location.latitude, location.longitude).then((name) => {
      if (!cancelled) setPlace(name);
    });
    return () => {
      cancelled = true;
    };
    // `key` resume las coordenadas: incluir `location` relanzaría la consulta en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return place;
}
