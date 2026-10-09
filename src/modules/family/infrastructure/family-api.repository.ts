import { apiClient } from '../../../shared/infrastructure/api/api-client';
import {
  AddFamilyMemberData,
  CreateFamilyData,
  Family,
  FamilyDetail,
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

  async addMember(familyId: string, data: AddFamilyMemberData): Promise<FamilyDetail> {
    const response = await apiClient.post<FamilyDetail>(
      `/api/families/${familyId}/members`,
      data
    );
    return response.data;
  }

  async removeMember(familyId: string, userId: string): Promise<void> {
    await apiClient.delete(`/api/families/${familyId}/members/${userId}`);
  }

  async updateMemberRole(familyId: string, userId: string, role: string): Promise<void> {
    await apiClient.patch(`/api/families/${familyId}/members/${userId}/role`, { role });
  }
}

export const familyRepository = new FamilyApiRepository();
