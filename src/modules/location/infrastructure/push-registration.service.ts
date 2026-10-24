import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { apiClient } from '../../../shared/infrastructure/api/api-client';
import { LOCATION_REQUEST_TASK } from './location-request.task';

/**
 * Registro del dispositivo en Firebase Cloud Messaging y alta del token en el backend.
 *
 * El token que necesita el backend es el **token nativo del dispositivo**
 * (`getDevicePushTokenAsync`), no el token de Expo: el push lo envía nuestro propio
 * servidor con el Firebase Admin SDK, sin pasar por el servicio de Expo.
 *
 * LIMITACIÓN CONOCIDA EN iOS: en iOS ese token nativo es un token **APNs**, y el Admin SDK
 * de Firebase solo acepta tokens de registro **FCM**. Por eso el flujo On-Demand funciona
 * hoy de extremo a extremo en Android, y en iOS hace falta una de estas dos cosas:
 *   (a) añadir `@react-native-firebase/messaging` para obtener un token FCM real, o
 *   (b) que el backend envíe a iOS directamente por APNs.
 * Ver `docs/CONFIGURACION_FIREBASE.md`. Mientras no se resuelva, en iOS no se registra
 * token: es preferible que la familia vea "no disponible" a que el backend crea que el
 * dispositivo es alcanzable y la petición se quede colgada para siempre.
 */
export class PushRegistrationService {
  private static tokenListener: Notifications.Subscription | null = null;
  private static taskRegistered = false;

  /**
   * Prepara el canal de notificaciones de Android. En Android 13+ hay que crearlo
   * ANTES de pedir el token o de solicitar el permiso, o el sistema no muestra el diálogo.
   */
  private static async ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync('location-requests', {
      name: 'Peticiones de ubicación',
      // IMPORTANCE_MIN: el usuario no debe ver nada cuando su familia pide la ubicación.
      // El canal existe solo porque Android lo exige para entregar el mensaje.
      importance: Notifications.AndroidImportance.MIN,
      showBadge: false,
    });
  }

  private static async ensurePermissions(): Promise<boolean> {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;

    if (!actual.canAskAgain) return false;

    const solicitado = await Notifications.requestPermissionsAsync();
    return solicitado.granted;
  }

  /**
   * Registra la tarea que atiende los data messages en segundo plano.
   * Idempotente: llamarla más de una vez no duplica el registro.
   */
  private static async ensureBackgroundTask(): Promise<void> {
    if (this.taskRegistered) return;

    try {
      await Notifications.registerTaskAsync(LOCATION_REQUEST_TASK);
      this.taskRegistered = true;
    } catch (error) {
      console.warn('[Push] no se pudo registrar la tarea en segundo plano:', error);
    }
  }

  /** Obtiene el token nativo del dispositivo, o null si esta plataforma no lo soporta aún. */
  static async getDeviceToken(): Promise<string | null> {
    if (Platform.OS === 'ios') {
      // Ver la limitación documentada arriba: en iOS esto devolvería un token APNs
      // que el backend no puede usar, así que no se registra nada.
      return null;
    }

    try {
      const token = await Notifications.getDevicePushTokenAsync();
      return typeof token.data === 'string' ? token.data : null;
    } catch (error) {
      console.warn('[Push] no se pudo obtener el token del dispositivo:', error);
      return null;
    }
  }

  /**
   * Flujo completo de alta: permisos, canal, token, envío al backend y tarea en segundo
   * plano. Se llama tras iniciar sesión y en cada arranque con sesión válida, porque el
   * token puede rotar cuando la app estaba cerrada.
   *
   * Devuelve el token registrado, o null si el dispositivo no puede recibir peticiones.
   */
  static async register(): Promise<string | null> {
    await this.ensureAndroidChannel();

    const permitido = await this.ensurePermissions();
    if (!permitido) {
      console.warn('[Push] permiso de notificaciones denegado: la familia no podrá localizar este teléfono.');
      return null;
    }

    await this.ensureBackgroundTask();

    const token = await this.getDeviceToken();
    if (!token) return null;

    await this.sendTokenToBackend(token);
    this.listenForTokenRotation();

    return token;
  }

  private static async sendTokenToBackend(fcmToken: string): Promise<void> {
    try {
      await apiClient.patch('/api/devices/fcm-token', { fcmToken });
    } catch (error) {
      console.warn('[Push] no se pudo registrar el token en el backend:', error);
    }
  }

  /**
   * Firebase rota los tokens por su cuenta. Sin volver a enviarlos, el backend se queda con
   * uno caducado y las peticiones de ubicación empiezan a fallar en silencio.
   */
  private static listenForTokenRotation(): void {
    if (this.tokenListener) return;

    this.tokenListener = Notifications.addPushTokenListener((token) => {
      if (typeof token.data === 'string') {
        void this.sendTokenToBackend(token.data);
      }
    });
  }

  /** Libera el listener. Se llama al cerrar sesión. */
  static dispose(): void {
    this.tokenListener?.remove();
    this.tokenListener = null;
  }
}
