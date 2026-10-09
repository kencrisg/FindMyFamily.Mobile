import { UserFamilyMembership } from '../../../profile/domain/entities/user-profile.types';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  systemRole?: 'admin' | 'user';
  families?: UserFamilyMembership[];
}

export interface DeviceInfo {
  id: string;
  deviceModel?: string;
  fcmToken?: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry?: string;
}

export interface LoginCredentials {
  phoneNumber: string;
  password: string;
  deviceModel?: string;
  fcmToken?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  deviceModel?: string;
  fcmToken?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  user: AuthUser;
  device?: DeviceInfo;
}
