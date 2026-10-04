import { create } from 'zustand';
import { SecureStorageService } from '../../../shared/infrastructure/storage/secure-storage';
import { apiClient } from '../../../shared/infrastructure/api/api-client';
import { authRepository } from '../infrastructure/auth-api.repository';
import { AuthUser, DeviceInfo, LoginCredentials, RegisterData } from '../domain/entities/auth.types';

interface AuthState {
  user: AuthUser | null;
  device: DeviceInfo | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  device: null,
  status: 'idle',
  error: null,

  initialize: async () => {
    set({ status: 'loading', error: null });
    try {
      const tokens = await SecureStorageService.getTokens();
      if (!tokens?.accessToken) {
        set({ status: 'unauthenticated', user: null, device: null });
        return;
      }

      // Validate session and retrieve profile
      const response = await apiClient.get('/api/users/me');
      const userProfile = response.data;

      set({
        user: {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          phoneNumber: userProfile.phoneNumber,
          role: userProfile.role,
        },
        status: 'authenticated',
      });
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

      set({
        user: result.user,
        device: result.device || null,
        status: 'authenticated',
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr.response?.data?.message ||
        'Error al iniciar sesión. Verifique su número y contraseña.';
      set({ status: 'unauthenticated', error: errorMessage });
      return false;
    }
  },

  register: async (data: RegisterData) => {
    set({ status: 'loading', error: null });
    try {
      const result = await authRepository.register(data);
      await SecureStorageService.saveTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      set({
        user: result.user,
        device: result.device || null,
        status: 'authenticated',
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr.response?.data?.message || 'Error al registrar la cuenta.';
      set({ status: 'unauthenticated', error: errorMessage });
      return false;
    }
  },

  logout: async () => {
    await SecureStorageService.clearAll();
    set({
      user: null,
      device: null,
      status: 'unauthenticated',
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
