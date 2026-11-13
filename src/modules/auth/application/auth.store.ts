import axios from 'axios';
import { create } from 'zustand';
import { SecureStorageService } from '../../../shared/infrastructure/storage/secure-storage';
import {
  apiClient,
  SessionExpiredError,
  setSessionExpiredHandler,
} from '../../../shared/infrastructure/api/api-client';
import { authRepository } from '../infrastructure/auth-api.repository';
import { AuthUser, DeviceInfo, LoginCredentials } from '../domain/entities/auth.types';
import { PushRegistrationService } from '../../location/infrastructure/push-registration.service';
import { useFamilyStore } from '../../family/application/family.store';
import { useLocationStore } from '../../location/application/location.store';

interface AuthState {
  user: AuthUser | null;
  device: DeviceInfo | null;
  /**
   * `offline`: hay una sesión guardada pero no se pudo validar con el servidor (sin red,
   * timeout, servidor caído o arrancando). La sesión se conserva y se puede reintentar.
   */
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'offline';
  error: string | null;

  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  /** Vuelve a leer el perfil del servidor (tras editar nombre, teléfono o familias). */
  reloadProfile: () => Promise<void>;
  /**
   * Obtiene una sesión nueva tras cambiar la propia contraseña. El backend revoca todas
   * las sesiones del usuario al cambiarla, incluida la de este teléfono: sin esto, la app
   * lo echaría sin explicación en cuanto caducara el token de acceso.
   */
  renewSession: (password: string) => Promise<boolean>;
  clearError: () => void;
  isSuperAdmin: () => boolean;
  isFamilyAdmin: (familyId?: string) => boolean;
}

/**
 * Selector para componentes. El super admin administra la plataforma y no usa la app
 * como familiar: no ve mapas ni ubicaciones, ni registra su teléfono para recibirlas.
 */
export const selectIsSuperAdmin = (state: { user: AuthUser | null }): boolean =>
  state.user?.systemRole === 'admin' || state.user?.role === 'admin';

interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  systemRole?: 'admin' | 'user';
  role?: string;
  families?: AuthUser['families'];
  locationSharingEnabled?: boolean;
}

/**
 * true si el error demuestra que la sesión ya no sirve: el refresh fue rechazado, o el
 * servidor responde que el token no vale (401/403) o que la cuenta ya no existe (404).
 * Cualquier otro error es de conectividad y NO debe cerrar la sesión.
 */
const isSessionInvalid = (error: unknown): boolean => {
  if (error instanceof SessionExpiredError) return true;
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 401 || status === 403 || status === 404;
};

const mapProfile = (profile: ProfileResponse): AuthUser => ({
  id: profile.id,
  firstName: profile.firstName,
  lastName: profile.lastName,
  phoneNumber: profile.phoneNumber,
  role: profile.systemRole || profile.role || 'user',
  systemRole: profile.systemRole,
  families: profile.families || [],
  locationSharingEnabled: profile.locationSharingEnabled ?? true,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  device: null,
  status: 'idle',
  error: null,

  initialize: async () => {
    set({ status: 'loading', error: null });

    // El cliente HTTP avisa por aquí cuando el refresh falla y la sesión ya no es
    // recuperable: sin este enlace la app se quedaba en `authenticated` sin tokens.
    setSessionExpiredHandler(() => {
      set({ user: null, device: null, status: 'unauthenticated', error: null });
    });

    try {
      const tokens = await SecureStorageService.getTokens();
      if (!tokens?.accessToken) {
        set({ status: 'unauthenticated', user: null, device: null });
        return;
      }

      // Validate session and retrieve profile with double-level roles
      const response = await apiClient.get<ProfileResponse>('/api/users/me');

      const user = mapProfile(response.data);
      set({ user, status: 'authenticated' });

      // El token de push puede haber rotado con la app cerrada: se vuelve a registrar en
      // cada arranque con sesión válida. Sin esto el backend guarda un token caducado y
      // las peticiones de ubicación fallan en silencio. El super admin no lo necesita:
      // nadie puede pedir su ubicación.
      if (!selectIsSuperAdmin({ user })) {
        void PushRegistrationService.register();
      }
    } catch (error) {
      if (isSessionInvalid(error)) {
        await SecureStorageService.clearAll();
        set({ status: 'unauthenticated', user: null, device: null });
        return;
      }

      // Fallo de red o del servidor: la sesión sigue siendo válida, así que NO se borra.
      // Antes se borraba siempre, y un backend gratuito que tarda en despertar cerraba la
      // sesión cada mañana. La pantalla de reintento vuelve a llamar a initialize().
      set({ status: 'offline', user: null, device: null });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ status: 'loading', error: null });
    try {
      const result = await authRepository.login(credentials);
      await SecureStorageService.saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      // Enrich user profile immediately
      try {
        const meRes = await apiClient.get<ProfileResponse>('/api/users/me');
        const user = mapProfile(meRes.data);
        set({
          user,
          device: result.device || null,
          status: 'authenticated',
          error: null,
        });

        // Alta del dispositivo en FCM una vez hay sesión (el PATCH necesita el token).
        if (!selectIsSuperAdmin({ user })) {
          void PushRegistrationService.register();
        }
      } catch {
        set({
          user: result.user,
          device: result.device || null,
          status: 'authenticated',
          error: null,
        });
      }

      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };

      // Sin `response` el fallo no viene del servidor: es red o almacenamiento del
      // dispositivo. Culpar a las credenciales en ese caso manda al usuario a revisar
      // una contraseña que era correcta.
      const esFalloDeRed = axiosErr.response === undefined;

      const errorMessage =
        axiosErr.response?.data?.message ||
        (axiosErr.response?.status === 429
          ? 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
          : esFalloDeRed
            ? 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
            : 'Error al iniciar sesión. Verifique su número y contraseña.');
      set({ status: 'unauthenticated', error: errorMessage });
      return false;
    }
  },

  logout: async () => {
    // Primero se revoca en el servidor; si la red falla, la sesión local se cierra
    // de todos modos para no dejar al usuario atrapado dentro de la app.
    try {
      const refreshToken = await SecureStorageService.getRefreshToken();
      if (refreshToken) {
        await authRepository.logout({ refreshToken });
      }
    } catch (error) {
      console.warn('No se pudo revocar la sesión en el servidor:', error);
    }

    PushRegistrationService.dispose();
    await SecureStorageService.clearAll();

    // Las familias y las coordenadas en memoria pertenecen a esta cuenta: si en el mismo
    // teléfono entra otra, no debe verlas ni un instante mientras se cargan las suyas.
    useFamilyStore.getState().reset();
    useLocationStore.getState().reset();
    set({
      user: null,
      device: null,
      status: 'unauthenticated',
      error: null,
    });
  },

  reloadProfile: async () => {
    const response = await apiClient.get<ProfileResponse>('/api/users/me');
    set({ user: mapProfile(response.data) });
  },

  renewSession: async (password: string) => {
    const user = get().user;
    if (!user) return false;

    try {
      // Va al repositorio y no a `login()` a propósito: `login()` pasa el estado a
      // `loading`, y eso taparía la pantalla con la capa de carga del layout raíz.
      const result = await authRepository.login({
        phoneNumber: user.phoneNumber,
        password,
        deviceModel: get().device?.deviceModel,
      });
      await SecureStorageService.saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      set({ device: result.device || get().device });
      return true;
    } catch {
      return false;
    }
  },

  clearError: () => set({ error: null }),

  isSuperAdmin: () => {
    const user = get().user;
    return user?.systemRole === 'admin' || user?.role === 'admin';
  },

  isFamilyAdmin: (familyId?: string) => {
    const user = get().user;
    if (!user) return false;
    if (user.systemRole === 'admin' || user.role === 'admin') return true;
    if (!familyId) return user.families?.some((f) => f.familyRole === 'admin') ?? false;
    return user.families?.some((f) => f.familyId === familyId && f.familyRole === 'admin') ?? false;
  },
}));
