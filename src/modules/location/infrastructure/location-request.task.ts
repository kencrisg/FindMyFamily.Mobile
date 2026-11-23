import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { capturePosition } from './position-capture';
import { locationRepository } from './location-api.repository';

/**
 * Tarea que atiende el Silent Push de localización.
 *
 * Es el corazón del modelo On-Demand: el backend manda un data message sin alerta visual,
 * el sistema despierta este código en segundo plano, se captura UNA coordenada de alta
 * precisión, se reporta y el GPS se apaga. No hay rastreo continuo en ningún momento.
 *
 * `defineTask` tiene que ejecutarse en el ámbito del módulo de un fichero que se evalúe al
 * cargar el bundle. Lo importa `index.js` (el entry), NO `src/app/_layout.tsx`: cuando
 * Android despierta la app sin interfaz para entregar el data message, solo se evalúa el
 * entry; los layouts de Expo Router no llegan a ejecutarse porque React no renderiza.
 * Definirla en el layout funcionaba con la app abierta y fallaba con la app cerrada.
 */
export const LOCATION_REQUEST_TASK = 'FINDMYFAMILY_LOCATION_REQUEST_TASK';

/** Tipo del data message que envía `FirebasePushNotificationService` en el backend. */
const LOCATION_REQUEST_TYPE = 'LOCATION_REQUEST';

interface LocationRequestPayload {
  type?: string;
  request_id?: string;
  requester_id?: string;
  family_id?: string;
}

/**
 * El payload llega en sitios distintos según la plataforma y el estado de la app:
 * en Android bajo `data`, y en iOS dentro de la estructura de APNs. Se buscan todas las
 * formas conocidas en lugar de asumir una, que es la causa habitual de que la tarea se
 * ejecute y no haga nada.
 */
const extractPayload = (data: unknown): LocationRequestPayload | null => {
  if (!data || typeof data !== 'object') return null;

  const raíz = data as Record<string, unknown>;

  const candidatos: unknown[] = [
    raíz,
    raíz.data,
    raíz.body,
    (raíz.notification as Record<string, unknown> | undefined)?.data,
    ((raíz.notification as Record<string, unknown> | undefined)?.request as Record<string, unknown> | undefined),
  ];

  for (const candidato of candidatos) {
    if (candidato && typeof candidato === 'object') {
      const posible = candidato as LocationRequestPayload;
      if (posible.type === LOCATION_REQUEST_TYPE) {
        return posible;
      }
    }
  }

  return null;
};

/** Tiempo máximo esperando una lectura nueva del GPS. */
const CAPTURE_TIMEOUT_MS = 15_000;

/** Antigüedad máxima de la última posición conocida para usarla si la nueva no llega. */
const MAX_FALLBACK_AGE_MS = 15 * 60_000;

TaskManager.defineTask(LOCATION_REQUEST_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[LocationRequestTask] error del sistema:', error);
    return;
  }

  const payload = extractPayload(data);
  if (!payload) {
    // No es una petición de ubicación: no es un fallo, simplemente no nos toca.
    return;
  }

  try {
    // El permiso que importa aquí es el de SEGUNDO PLANO: la app no está en pantalla.
    const { status } = await Location.getBackgroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[LocationRequestTask] sin permiso de ubicación en segundo plano; no se reporta.');
      return;
    }

    // 1. Encender el GPS y tomar una única lectura de alta precisión. Con límite de tiempo:
    //    sin él, en interiores la lectura podía no llegar nunca y la familia veía "no
    //    disponible". 15 s deja margen para responder dentro de los 30 s que espera quien
    //    pregunta. Si no llega, se envía la última posición conocida reciente, con su hora.
    const location = await capturePosition({
      accuracy: Location.Accuracy.High,
      timeoutMs: CAPTURE_TIMEOUT_MS,
      maxLastKnownAgeMs: MAX_FALLBACK_AGE_MS,
    });
    if (!location) {
      console.warn('[LocationRequestTask] el GPS no dio ninguna posición a tiempo; no se reporta.');
      return;
    }

    // 2. Reportar al backend. `toISOString()` siempre termina en 'Z': el backend exige UTC
    //    y rechaza marcas temporales sin zona horaria o en el futuro.
    await locationRepository.reportLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      capturedAt: new Date(location.timestamp).toISOString(),
    });

    // 3. El GPS se apaga al salir de aquí: no queda ninguna suscripción activa.
  } catch (err) {
    // Un fallo aquí es silencioso por definición (nadie está mirando la pantalla).
    // El solicitante lo verá como un tiempo de espera agotado.
    console.error('[LocationRequestTask] no se pudo reportar la ubicación:', err);
  }
});
