import { AppState, Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';

/**
 * Ajustes de batería de Android.
 *
 * Android no permite que una app se marque sola como "sin restricciones": la decisión es
 * del usuario. Lo que sí se puede hacer es abrir directamente el diálogo del sistema que
 * la solicita (`ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`), en lugar de mandar al
 * usuario a buscar la app dentro de los ajustes.
 *
 * Requiere la permisión `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` en el AndroidManifest.
 * En Google Play es una permisión restringida: si algún día se publica allí, hay que
 * justificar que la función principal (compartir ubicación bajo demanda) la necesita.
 */

const REQUEST_IGNORE_BATTERY_OPTIMIZATIONS = 'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS';
const APPLICATION_DETAILS_SETTINGS = IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS;
const CATEGORY_DEFAULT = 'android.intent.category.DEFAULT';
const FLAG_ACTIVITY_NEW_TASK = 0x10000000;

// En un APK de release el paquete siempre es este; el fallback evita depender de que
// `expoConfig` esté disponible en todos los tipos de build.
const PACKAGE_NAME = Constants.expoConfig?.android?.package ?? 'com.kencrisgdev.findmyfamily';

export type BatterySettingsResult =
  /** Se abrió el diálogo de batería del sistema (o ya estaba concedido). */
  | 'requested'
  /** El diálogo no apareció y se abrieron los ajustes de la app. */
  | 'app-settings'
  /** No se pudo abrir ninguna pantalla. */
  | 'failed';

interface LaunchOutcome {
  /** `startActivityAsync` completó sin lanzar una excepción. */
  opened: boolean;
  /**
   * La app salió de primer plano o perdió el foco mientras la pantalla estaba abierta.
   * Es la señal fiable de que el sistema sí mostró algo: si el intent resuelve sin que
   * la app pierda foco o pase a segundo plano, el fabricante lo aceptó pero no mostró UI.
   */
  leftApp: boolean;
  resultCode?: IntentLauncher.ResultCode;
}

/**
 * Lanza una pantalla del sistema y detecta si realmente llegó a mostrarse.
 *
 * `expo-intent-launcher` no dice si el intent encontró una pantalla visible: su promesa
 * se resuelve tanto al volver de Ajustes como si el fabricante hubiera cerrado la
 * actividad inmediatamente. `AppState` (`change` y `blur`) distingue los dos casos.
 */
async function launchSystemActivity(
  action: string,
  params?: IntentLauncher.IntentLauncherParams
): Promise<LaunchOutcome> {
  let leftApp = AppState.currentState !== 'active';

  const markLeftApp = () => {
    leftApp = true;
  };

  const changeSubscription = AppState.addEventListener('change', (state) => {
    if (state !== 'active') {
      markLeftApp();
    }
  });
  // Un diálogo del sistema sobre la actividad actual puede disparar `blur` sin pasar a `background`.
  const blurSubscription = AppState.addEventListener('blur', markLeftApp);

  try {
    const result = await IntentLauncher.startActivityAsync(action, params);
    return { opened: true, leftApp, resultCode: result.resultCode };
  } catch {
    return { opened: false, leftApp };
  } finally {
    changeSubscription.remove();
    blurSubscription.remove();
  }
}

/**
 * Abre Ajustes → Apps → FindMyFamily en el sistema. Es el fallback cuando el teléfono
 * no muestra el diálogo directo de optimización de batería.
 */
export async function openAppSystemSettings(): Promise<boolean> {
  // `Linking.openSettings()` usa `ACTION_APPLICATION_DETAILS_SETTINGS` con
  // `CATEGORY_DEFAULT` y `FLAG_ACTIVITY_NEW_TASK` usando el package real de la app.
  try {
    await Linking.openSettings();
    return true;
  } catch {
    if (Platform.OS !== 'android') {
      return false;
    }
  }

  const result = await launchSystemActivity(APPLICATION_DETAILS_SETTINGS, {
    data: `package:${PACKAGE_NAME}`,
    category: CATEGORY_DEFAULT,
    flags: FLAG_ACTIVITY_NEW_TASK,
  });

  return result.opened && result.leftApp;
}

/**
 * Primero intenta abrir el diálogo "Permitir que FindMyFamily ignore la optimización de
 * batería". Si el teléfono no lo muestra (pasa en varias capas de fabricante), abre
 * directamente los ajustes de la app para que el usuario cambie "Batería" a mano.
 */
export async function requestIgnoreBatteryOptimizations(): Promise<BatterySettingsResult> {
  if (Platform.OS !== 'android') {
    const opened = await openAppSystemSettings();
    return opened ? 'app-settings' : 'failed';
  }

  const request = await launchSystemActivity(REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
    data: `package:${PACKAGE_NAME}`,
  });

  // Si la app salió de primer plano o perdió el foco, el diálogo del sistema se abrió.
  // Si devolvió `Success` (-1) directo, la exención ya estaba concedida previamente.
  if (request.leftApp || request.resultCode === IntentLauncher.ResultCode.Success) {
    return 'requested';
  }

  // El intent no mostró diálogo: llevar a Ajustes → Apps → FindMyFamily.
  const appSettingsOpened = await openAppSystemSettings();
  return appSettingsOpened ? 'app-settings' : 'failed';
}
