import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { locationRepository } from './location-api.repository';

export const BACKGROUND_LOCATION_TASK = 'FINDMYFAMILY_EPHEMERAL_LOCATION_TASK';

// Define the background task for ephemeral GPS snapshot
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    // 1. Obtener 1 coordenada única de alta precisión
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // 2. Reportar al backend
    await locationRepository.reportLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      capturedAt: new Date(location.timestamp).toISOString(),
    });

    // 3. Apagado inmediato (no dejamos tracking activo continuo)
  } catch (error) {
    console.error('Error during ephemeral background location task:', error);
  }
});

export class BackgroundTaskManager {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        return false;
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      return bgStatus === 'granted';
    } catch (error) {
      console.warn('Error requesting location permissions:', error);
      return false;
    }
  }

  static async reportCurrentLocationNow(): Promise<void> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await locationRepository.reportLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        capturedAt: new Date(location.timestamp).toISOString(),
      });
    } catch (error) {
      console.warn('Error reporting current location:', error);
    }
  }
}
