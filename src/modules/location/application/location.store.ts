import { create } from 'zustand';
import { locationRepository } from '../infrastructure/location-api.repository';
import { signalRLocationService } from '../infrastructure/signalr-location.service';
import { LocationCoordinate } from '../domain/entities/location.types';

/**
 * Tiempo que se espera la respuesta de un familiar tras enviarle el Silent Push.
 *
 * Existe porque el backend no puede saber si un teléfono está apagado: Firebase acepta el
 * push y lo encola, así que el backend responde REQUESTED y nadie contesta nunca. El único
 * sitio donde se puede detectar ese caso es aquí, esperando el evento de SignalR.
 *
 * 30 s cubre el camino completo con holgura (push → despertar el proceso → fijar GPS →
 * POST → difusión por SignalR), que en frío suele tardar entre 5 y 15 segundos.
 */
export const LOCATION_REQUEST_TIMEOUT_MS = 30_000;

/** Estado de la petición de ubicación de un familiar concreto. */
export type MemberRequestStatus = 'idle' | 'waiting' | 'received' | 'unavailable';

export interface MemberRequestState {
  status: MemberRequestStatus;
  message: string | null;
  /** Id de la petición en curso; null cuando el familiar era inalcanzable. */
  requestId: string | null;
}

interface LocationState {
  locations: Record<string, LocationCoordinate>; // Keyed by userId
  requests: Record<string, MemberRequestState>; // Keyed by targetUserId
  error: string | null;

  requestLocation: (targetUserId: string, familyId: string) => Promise<boolean>;
  fetchLatestLocation: (familyId: string, userId: string) => Promise<void>;
  updateLiveLocation: (
    location: LocationCoordinate,
    options?: { keepRequestState?: boolean }
  ) => void;
  getRequestState: (userId: string) => MemberRequestState;
  cancelRequest: (userId: string) => void;
  startSignalR: () => Promise<void>;
  stopSignalR: () => Promise<void>;
  clearStatus: () => void;
}

const IDLE: MemberRequestState = { status: 'idle', message: null, requestId: null };

// Los temporizadores viven fuera del estado: son identificadores del entorno, no datos
// que la interfaz deba renderizar, y meterlos en el store provocaría renders inútiles.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const clearTimer = (userId: string) => {
  const timer = timers.get(userId);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(userId);
  }
};

/** Texto de "no disponible" acompañado de la hora de su última ubicación conocida. */
const buildUnavailableMessage = (last: LocationCoordinate | undefined): string => {
  if (!last) {
    return 'Tu familiar no está disponible y todavía no hay ninguna ubicación registrada suya.';
  }

  const fecha = new Date(last.capturedAt);
  const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hoy = new Date().toDateString() === fecha.toDateString();
  const cuando = hoy ? `hoy a las ${hora}` : `el ${fecha.toLocaleDateString()} a las ${hora}`;

  return `Tu familiar no está disponible. Su última ubicación conocida es de ${cuando}.`;
};

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: {},
  requests: {},
  error: null,

  requestLocation: async (targetUserId: string, familyId: string) => {
    clearTimer(targetUserId);

    set((state) => ({
      error: null,
      requests: {
        ...state.requests,
        [targetUserId]: {
          status: 'waiting',
          message: 'Despertando el teléfono de tu familiar…',
          requestId: null,
        },
      },
    }));

    try {
      const response = await locationRepository.requestLocation(targetUserId, familyId);

      // Si el backend ya trae una última ubicación conocida, se pinta de inmediato: es el
      // único dato disponible mientras se espera, y el definitivo si nadie responde.
      if (response.lastKnownLocation) {
        get().updateLiveLocation(response.lastKnownLocation, { keepRequestState: true });
      }

      // El backend ya sabe que es inalcanzable (sin dispositivo activo, sin token, o el
      // envío falló). No hay nada que esperar.
      if (response.status === 'UNAVAILABLE') {
        set((state) => ({
          requests: {
            ...state.requests,
            [targetUserId]: {
              status: 'unavailable',
              message: response.message,
              requestId: null,
            },
          },
        }));
        return false;
      }

      // El push salió. A partir de aquí solo el temporizador puede distinguir
      // "va a contestar" de "el teléfono está apagado".
      const timer = setTimeout(() => {
        timers.delete(targetUserId);

        set((state) => {
          // Si entretanto llegó la ubicación, no se pisa el resultado.
          if (state.requests[targetUserId]?.status !== 'waiting') {
            return state;
          }

          return {
            ...state,
            requests: {
              ...state.requests,
              [targetUserId]: {
                status: 'unavailable',
                message: buildUnavailableMessage(state.locations[targetUserId]),
                requestId: null,
              },
            },
          };
        });
      }, LOCATION_REQUEST_TIMEOUT_MS);

      timers.set(targetUserId, timer);

      set((state) => ({
        requests: {
          ...state.requests,
          [targetUserId]: {
            status: 'waiting',
            message: 'Petición enviada. Esperando la ubicación de tu familiar…',
            requestId: response.requestId,
          },
        },
      }));

      return true;
    } catch (err: unknown) {
      clearTimer(targetUserId);

      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      const mensaje =
        axiosErr.response?.data?.message ||
        (axiosErr.response?.status === 429
          ? 'Has solicitado la ubicación demasiadas veces. Espera unos minutos.'
          : 'No se pudo solicitar la ubicación.');

      set((state) => ({
        error: mensaje,
        requests: {
          ...state.requests,
          [targetUserId]: { status: 'unavailable', message: mensaje, requestId: null },
        },
      }));

      return false;
    }
  },

  fetchLatestLocation: async (familyId: string, userId: string) => {
    try {
      const loc = await locationRepository.getLatestLocation(familyId, userId);
      if (loc) {
        get().updateLiveLocation(loc, { keepRequestState: true });
      }
    } catch {
      // Ignore if no prior data
    }
  },

  updateLiveLocation: (
    location: LocationCoordinate,
    options?: { keepRequestState?: boolean }
  ) => {
    const normalizada: LocationCoordinate = {
      ...location,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };

    set((state) => {
      const requests = { ...state.requests };

      // Una ubicación recibida mientras se esperaba cierra la petición: se cancela el
      // temporizador para que no marque "no disponible" sobre un dato que ya llegó.
      if (!options?.keepRequestState && state.requests[location.userId]?.status === 'waiting') {
        clearTimer(location.userId);
        requests[location.userId] = {
          status: 'received',
          message: null,
          requestId: null,
        };
      }

      return {
        locations: { ...state.locations, [location.userId]: normalizada },
        requests,
      };
    });
  },

  getRequestState: (userId: string) => get().requests[userId] ?? IDLE,

  cancelRequest: (userId: string) => {
    clearTimer(userId);
    set((state) => {
      const requests = { ...state.requests };
      delete requests[userId];
      return { requests };
    });
  },

  startSignalR: async () => {
    await signalRLocationService.start((location) => {
      get().updateLiveLocation(location);
    });
  },

  stopSignalR: async () => {
    // Al cortar el canal en vivo ya no puede llegar ninguna respuesta: dejar
    // temporizadores corriendo marcaría "no disponible" sobre una pantalla cerrada.
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    await signalRLocationService.stop();
  },

  clearStatus: () => set({ error: null }),
}));
