import { apiClient } from '../../../shared/infrastructure/api/api-client';
import {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  RegisterData,
} from '../domain/entities/auth.types';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface';

export class AuthApiRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  }

  async refreshToken(tokens: { refreshToken: string; deviceModel?: string; fcmToken?: string }): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/api/auth/refresh-token', tokens);
    return response.data;
  }
}

export const authRepository = new AuthApiRepository();
