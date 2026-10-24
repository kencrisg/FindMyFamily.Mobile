import { apiClient } from '../../../shared/infrastructure/api/api-client';
import { SecureStorageService } from '../../../shared/infrastructure/storage/secure-storage';
import {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  LogoutPayload,
  RefreshTokenPayload,
} from '../domain/entities/auth.types';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface';

export class AuthApiRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // El installationId identifica al dispositivo en el backend; sin él, dos teléfonos
    // del mismo usuario comparten registro y se expulsan mutuamente de la sesión.
    const installationId =
      credentials.installationId ?? (await SecureStorageService.getInstallationId());

    const response = await apiClient.post<AuthResponse>('/api/auth/login', {
      ...credentials,
      installationId,
    });
    return response.data;
  }

  async refreshToken(payload: RefreshTokenPayload): Promise<AuthTokens> {
    const installationId =
      payload.installationId ?? (await SecureStorageService.getInstallationId());

    const response = await apiClient.post<AuthTokens>('/api/auth/refresh-token', {
      ...payload,
      installationId,
    });
    return response.data;
  }

  /**
   * Revoca el refresh token en el servidor. Antes el cierre de sesión solo borraba
   * los tokens del teléfono, de modo que el refresh token seguía siendo válido
   * durante 90 días para quien lo hubiera obtenido.
   */
  async logout(payload: LogoutPayload): Promise<void> {
    await apiClient.post('/api/auth/logout', {
      refreshToken: payload.refreshToken,
      allDevices: payload.allDevices ?? false,
    });
  }
}

export const authRepository = new AuthApiRepository();
