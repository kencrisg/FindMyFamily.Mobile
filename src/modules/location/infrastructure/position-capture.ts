import * as Location from 'expo-location';

/**
 * Lectura de posición que nunca se queda colgada.
 *
 * `getCurrentPositionAsync` espera una lectura NUEVA del GPS y, si no llega (en interiores,
 * con el GPS recién encendido o en el emulador), no devuelve nada ni falla: se queda
 * esperando. Por eso el botón "dónde estoy" parecía no hacer nada, y la tarea que responde
 * a las peticiones de la familia podía no responder nunca.
 *
 * Aquí se espera como mucho `timeoutMs`. Si la lectura nueva no llega, se usa la última
 * posición conocida del sistema, siempre que no sea más antigua que `maxLastKnownAgeMs`.
 * Esa posición conserva su hora real (`timestamp`), así que quien la vea sabrá que es de
 * "hace X min" y no la confundirá con una actual.
 */
export async function capturePosition(options: {
  accuracy: Location.Accuracy;
  timeoutMs: number;
  maxLastKnownAgeMs: number;
}): Promise<Location.LocationObject | null> {
  const fresh = await getFreshPosition(options.accuracy, options.timeoutMs);
  if (fresh) return fresh;

  return Location.getLastKnownPositionAsync({ maxAge: options.maxLastKnownAgeMs }).catch(() => null);
}

/** Lectura nueva del GPS, o null si no llega a tiempo o falla. */
export function getFreshPosition(
  accuracy: Location.Accuracy,
  timeoutMs: number
): Promise<Location.LocationObject | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);

    Location.getCurrentPositionAsync({ accuracy })
      .then((location) => resolve(location))
      .catch(() => resolve(null))
      .finally(() => clearTimeout(timer));
  });
}
