/**
 * Nombre de un sitio a partir de sus coordenadas, con Nominatim (OpenStreetMap).
 *
 * Se usa en lugar de la geocodificación del sistema (`Location.reverseGeocodeAsync`) porque,
 * probada en el Zócalo de la CDMX, Android devolvió una dirección a 12 km ("Presidentes
 * Ejidales, Coyoacán"), mientras que Nominatim dio la correcta ("Centro"). Además coincide con
 * los nombres que muestra el mapa, que también es de OpenStreetMap, y es igual en iOS y Android.
 *
 * Política de uso de Nominatim (https://operations.osmfoundation.org/policies/nominatim/):
 *   - identificar la app en el User-Agent,
 *   - como máximo una petición por segundo,
 *   - guardar los resultados en caché (lo hace quien llama: `usePlaceName`).
 *
 * Privacidad: solo se envían las coordenadas, sin nombre ni identificador de la persona.
 */

const ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'FindMyFamily/1.0 (com.kencrisgdev.findmyfamily)';
const MIN_INTERVAL_MS = 1100;
const TIMEOUT_MS = 8000;

interface NominatimAddress {
  road?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
}

/** "Barrio, Ciudad", con lo más concreto que haya de cada parte. */
const formatPlace = (address: NominatimAddress): string | null => {
  const local = address.neighbourhood || address.quarter || address.suburb || address.road;
  const city = address.city || address.town || address.village || address.municipality || address.state;
  const parts = [local, city].filter((part, index, all): part is string => !!part && all.indexOf(part) === index);
  return parts.length > 0 ? parts.join(', ') : null;
};

// Cola: las peticiones salen de una en una, separadas al menos MIN_INTERVAL_MS, para no
// superar nunca el límite de una por segundo aunque varios familiares se pinten a la vez.
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPlace(latitude: number, longitude: number): Promise<string | null> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) await wait(MIN_INTERVAL_MS - elapsed);
  lastRequestAt = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${ENDPOINT}?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&accept-language=es`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim respondió ${response.status}`);
    const data = (await response.json()) as { address?: NominatimAddress };
    return data.address ? formatPlace(data.address) : null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Devuelve "Barrio, Ciudad", o null si no hay nombre para ese sitio.
 * Lanza error si la consulta falla (sin red, límite superado…), para que no se guarde en caché.
 */
export function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const result = queue.then(() => fetchPlace(latitude, longitude));
  queue = result.catch(() => undefined);
  return result;
}
