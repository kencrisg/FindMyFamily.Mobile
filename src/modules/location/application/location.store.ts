import { create } from 'zustand';
import { locationRepository } from '../infrastructure/location-api.repository';
import { signalRLocationService } from '../infrastructure/signalr-location.service';
import { LocationCoordinate } from '../domain/entities/location.types';

interface LocationState {
  locations: Record<string, LocationCoordinate>; // Keyed by userId
  isRequesting: boolean;
  requestMessage: string | null;
  error: string | null;

  requestLocation: (targetUserId: string, familyId: string) => Promise<boolean>;
  fetchLatestLocation: (familyId: string, userId: string) => Promise<void>;
  updateLiveLocation: (location: LocationCoordinate) => void;
  startSignalR: () => Promise<void>;
  stopSignalR: () => Promise<void>;
  clearStatus: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: {},
  isRequesting: false,
  requestMessage: null,
  error: null,

  requestLocation: async (targetUserId: string, familyId: string) => {
    set({ isRequesting: true, error: null, requestMessage: null });
    try {
      const response = await locationRepository.requestLocation(targetUserId, familyId);
      set({
        isRequesting: false,
        requestMessage: 'Petición enviada. Despertando el teléfono de tu familiar...',
      });
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      set({
        isRequesting: false,
        error: axiosErr.response?.data?.message || 'No se pudo solicitar la ubicación.',
      });
      return false;
    }
  },

  fetchLatestLocation: async (familyId: string, userId: string) => {
    try {
      const loc = await locationRepository.getLatestLocation(familyId, userId);
      if (loc) {
        set((state) => ({
          locations: {
            ...state.locations,
            [userId]: {
              ...loc,
              latitude: Number(loc.latitude),
              longitude: Number(loc.longitude),
            },
          },
        }));
      }
    } catch {
      // Ignore if no prior data
    }
  },

  updateLiveLocation: (location: LocationCoordinate) => {
    set((state) => ({
      locations: {
        ...state.locations,
        [location.userId]: {
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        },
      },
    }));
  },

  startSignalR: async () => {
    await signalRLocationService.start((location) => {
      get().updateLiveLocation(location);
    });
  },

  stopSignalR: async () => {
    await signalRLocationService.stop();
  },

  clearStatus: () => set({ requestMessage: null, error: null }),
}));
