import { apiClient } from '../../../shared/infrastructure/api/api-client';
import {
  UpdatePasswordRequest,
  UpdatePhoneRequest,
  UserProfile,
} from '../domain/entities/user-profile.types';
import { IProfileRepository } from '../domain/interfaces/profile-repository.interface';

export class ProfileApiRepository implements IProfileRepository {
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/users/me');
    return response.data;
  }

  async updatePhone(data: UpdatePhoneRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/users/me/phone', data);
    return response.data;
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await apiClient.put('/api/users/me/password', data);
  }
}

export const profileRepository = new ProfileApiRepository();
