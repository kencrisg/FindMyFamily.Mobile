import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getApiErrorMessage } from '../utils/api-error';

export interface Resource<T> {
  data: T | null;
  /** Solo en la primera carga: las recargas posteriores no vacían la pantalla. */
  isLoading: boolean;
  /** Recarga iniciada por el usuario (deslizar hacia abajo). */
  isRefreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Carga datos de la API y los vuelve a cargar cada vez que la pantalla recupera el foco.
 *
 * Recargar al volver es lo que mantiene las listas al día sin un store global: al regresar
 * de crear un usuario o de editar una familia, la lista ya refleja el cambio.
 *
 * @param loader Debe ser estable (useCallback), o se recargaría en cada render.
 */
export function useResource<T>(loader: () => Promise<T>, fallbackError: string): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Una respuesta que llega con la pantalla ya cerrada no debe tocar su estado.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      const result = await loader();
      if (!mounted.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(getApiErrorMessage(err, fallbackError));
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [loader, fallbackError]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await reload();
    if (mounted.current) setIsRefreshing(false);
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return { data, isLoading, isRefreshing, error, reload, refresh };
}
