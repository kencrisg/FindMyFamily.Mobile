import { AuthResponse, AuthTokens, LoginCredentials, RegisterData } from '../entities/auth.types';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(data: RegisterData): Promise<AuthResponse>;
  refreshToken(tokens: AuthTokens): Promise<AuthTokens>;
}
