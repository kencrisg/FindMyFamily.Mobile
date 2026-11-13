import { apiClient } from '../../../shared/infrastructure/api/api-client';
import { UserProfile } from '../../profile/domain/entities/user-profile.types';
import { AdminCreateUserData, AdminUpdateUserData } from '../domain/entities/admin.types';
import { IAdminUsersRepository } from '../domain/interfaces/admin-users-repository.interface';

/**
 * El backend pagina como máximo de 100 en 100. Para una plataforma familiar es más que
 * suficiente en una sola página; si algún día se supera, aquí es donde hay que paginar.
 */
const PAGE_SIZE = 100;

export class AdminUsersApiRepository implements IAdminUsersRepository {
  async getUsers(): Promise<UserProfile[]> {
    const response = await apiClient.get<UserProfile[]>('/api/users', {
      params: { page: 1, pageSize: PAGE_SIZE },
    });
    return response.data;
  }

  async getUser(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(`/api/users/${userId}`);
    return response.data;
  }

  async createUser(data: AdminCreateUserData): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/api/users', data);
    return response.data;
  }

  async updateUser(userId: string, data: AdminUpdateUserData): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>(`/api/users/${userId}`, data);
    return response.data;
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await apiClient.patch(`/api/users/${userId}/password`, { newPassword });
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/users/${userId}`);
  }

  async getDeletedUsers(): Promise<UserProfile[]> {
    const response = await apiClient.get<UserProfile[]>('/api/users/deleted', {
      params: { page: 1, pageSize: PAGE_SIZE },
    });
    return response.data;
  }

  async restoreUser(userId: string): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>(`/api/users/${userId}/restore`);
    return response.data;
  }
}

export const adminUsersRepository = new AdminUsersApiRepository();
