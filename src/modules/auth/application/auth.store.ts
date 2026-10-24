import { create } from 'zustand';
import { SecureStorageService } from '../../../shared/infrastructure/storage/secure-storage';
import {
  apiClient,
  setSessionExpiredHandler,
} from '../../../shared/infrastructure/api/api-client';
import { authRepository } from '../infrastructure/auth-api.repository';
import { AuthUser, DeviceInfo, LoginCredentials } from '../domain/entities/auth.types';
import { PushRegistrationService } from '../../location/infrastructure/push-registration.service';

interface AuthState {
  user: AuthUser | null;
  device: DeviceInfo | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;

  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  isSuperAdmin: () => boolean;
  isFamilyAdmin: (familyId?: string) => boolean;
}

interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  systemRole?: 'admin' | 'user';
  role?: string;
  families?: AuthUser['families'];
}

const mapProfile = (profile: ProfileResponse): AuthUser => ({
  id: profile.id,
  firstName: profile.firstName,
  lastName: profile.lastName,
  phoneNumber: profile.phoneNumber,
  role: profile.systemRole || profile.role || 'user',
  systemRole: profile.systemRole,
  families: profile.families || [],
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

      set({
        user: mapProfile(response.data),
        status: 'authenticated',
      });

      // El token de push puede haber rotado con la app cerrada: se vuelve a registrar en
      // cada arranque con sesión válida. Sin esto el backend guarda un token caducado y
      // las peticiones de ubicación fallan en silencio.
      void PushRegistrationService.register();
    } catch {
      await SecureStorageService.clearAll();
      set({ status: 'unauthenticated', user: null, device: null });
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
        set({
          user: mapProfile(meRes.data),
          device: result.device || null,
          status: 'authenticated',
          error: null,
        });

        // Alta del dispositivo en FCM una vez hay sesión (el PATCH necesita el token).
        void PushRegistrationService.register();
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
      const errorMessage =
        axiosErr.response?.data?.message ||
        (axiosErr.response?.status === 429
          ? 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
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
    set({
      user: null,
      device: null,
      status: 'unauthenticated',
      error: null,
    });
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
