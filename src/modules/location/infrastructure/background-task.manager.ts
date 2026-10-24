import * as Location from 'expo-location';
import { locationRepository } from './location-api.repository';

export interface LocationPermissionState {
  foreground: boolean;
  background: boolean;
}

/**
 * Permisos de ubicación y reporte manual.
 *
 * La captura automática al recibir el Silent Push vive en `location-request.task.ts`:
 * aquí ya no se define ninguna tarea. Antes había una declarada con `TaskManager.defineTask`
 * que nada registraba ni disparaba, así que nunca se ejecutaba.
 */
export class BackgroundTaskManager {
  /**
   * Pide los permisos de ubicación. Devuelve el estado de ambos niveles en lugar de un
   * único booleano, para que la interfaz pueda explicar qué falta: sin el permiso de
   * segundo plano, la familia no puede localizar este teléfono con la app cerrada.
   */
  static async requestPermissions(): Promise<LocationPermissionState> {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        return { foreground: false, background: false };
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      return { foreground: true, background: bgStatus === 'granted' };
    } catch (error) {
      console.warn('Error requesting location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /** Reporte manual desde primer plano (compartir mi ubicación ahora). */
  static async reportCurrentLocationNow(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await locationRepository.reportLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        capturedAt: new Date(location.timestamp).toISOString(),
      });

      return true;
    } catch (error) {
      console.warn('Error reporting current location:', error);
      return false;
    }
  }
}
