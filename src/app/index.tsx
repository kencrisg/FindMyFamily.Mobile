import React from 'react';
import { Redirect } from 'expo-router';
import { selectIsSuperAdmin, useAuthStore } from '../modules/auth/application/auth.store';

/**
 * Ruta inicial. Stack.Protected (en el layout raíz) devuelve aquí al usuario cada vez que
 * cambia su sesión, y esta ruta decide a qué grupo enviarlo.
 *
 * Mientras se comprueba la sesión no redirige: el layout ya muestra la capa de carga, y
 * mandarlo al login para luego sacarlo de ahí producía un parpadeo y una navegación de más.
 */
export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);
  const isSuperAdmin = useAuthStore(selectIsSuperAdmin);

  // `offline` tampoco redirige: el layout muestra la pantalla de reintento encima, y enviar
  // al login a alguien que tiene la sesión guardada le haría creer que la ha perdido.
  if (status === 'loading' || status === 'idle' || status === 'offline') {
    return null;
  }

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={isSuperAdmin ? '/(admin)/families' : '/(main)'} />;
}
