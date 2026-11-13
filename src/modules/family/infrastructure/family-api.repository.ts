import { apiClient } from '../../../shared/infrastructure/api/api-client';
import {
  AddFamilyMemberData,
  CreateFamilyData,
  CreateFamilyMemberUserData,
  Family,
  FamilyDetail,
  FamilyRole,
  UpdateFamilyMemberUserData,
} from '../domain/entities/family.types';
import { IFamilyRepository } from '../domain/interfaces/family-repository.interface';

export class FamilyApiRepository implements IFamilyRepository {
  async getMyFamilies(): Promise<Family[]> {
    const response = await apiClient.get<Family[]>('/api/families');
    return response.data;
  }

  async getFamilyById(familyId: string): Promise<FamilyDetail> {
    const response = await apiClient.get<FamilyDetail>(`/api/families/${familyId}`);
    return response.data;
  }

  async createFamily(data: CreateFamilyData): Promise<Family> {
    const response = await apiClient.post<Family>('/api/families', data);
    return response.data;
  }

  async renameFamily(familyId: string, name: string): Promise<Family> {
    const response = await apiClient.patch<Family>(`/api/families/${familyId}`, { name });
    return response.data;
  }

  async deleteFamily(familyId: string): Promise<void> {
    await apiClient.delete(`/api/families/${familyId}`);
  }

  async linkMember(familyId: string, data: AddFamilyMemberData): Promise<FamilyDetail> {
    const response = await apiClient.post<FamilyDetail>(
      `/api/families/${familyId}/members/link`,
      data
    );
    return response.data;
  }

  async createMemberUser(familyId: string, data: CreateFamilyMemberUserData): Promise<FamilyDetail> {
    const response = await apiClient.post<FamilyDetail>(
      `/api/families/${familyId}/members`,
      data
    );
    return response.data;
  }

  async updateMemberUser(
    familyId: string,
    userId: string,
    data: UpdateFamilyMemberUserData
  ): Promise<FamilyDetail> {
    const response = await apiClient.patch<FamilyDetail>(
      `/api/families/${familyId}/members/${userId}`,
      data
    );
    return response.data;
  }

  async resetMemberPassword(familyId: string, userId: string, newPassword: string): Promise<void> {
    await apiClient.patch(`/api/families/${familyId}/members/${userId}/password`, { newPassword });
  }

  async updateMemberRole(familyId: string, userId: string, role: FamilyRole): Promise<void> {
    await apiClient.patch(`/api/families/${familyId}/members/${userId}/role`, { role });
  }

  async removeMember(familyId: string, userId: string): Promise<void> {
    await apiClient.delete(`/api/families/${familyId}/members/${userId}`);
  }
}

export const familyRepository = new FamilyApiRepository();
