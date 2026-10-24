import {
  AuthResponse,
  AuthTokens,
  LoginCredentials,
  LogoutPayload,
  RefreshTokenPayload,
} from '../entities/auth.types';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  refreshToken(payload: RefreshTokenPayload): Promise<AuthTokens>;
  logout(payload: LogoutPayload): Promise<void>;
}
