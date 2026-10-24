import { apiClient } from '../../../shared/infrastructure/api/api-client';
import {
  LocationCoordinate,
  LocationRequestResponse,
  ReportLocationPayload,
} from '../domain/entities/location.types';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface';

export class LocationApiRepository implements ILocationRepository {
  async requestLocation(targetUserId: string, familyId: string): Promise<LocationRequestResponse> {
    const response = await apiClient.post<LocationRequestResponse>('/api/locations/request', {
      targetUserId,
      familyId,
    });
    return response.data;
  }

  async reportLocation(payload: ReportLocationPayload): Promise<LocationCoordinate> {
    const response = await apiClient.post<LocationCoordinate>('/api/locations/report', payload);
    return response.data;
  }

  async getLatestLocation(familyId: string, userId: string): Promise<LocationCoordinate | null> {
    try {
      const response = await apiClient.get<LocationCoordinate>(
        `/api/locations/families/${familyId}/users/${userId}/latest`
      );
      return response.data;
    } catch {
      return null;
    }
  }

}

export const locationRepository = new LocationApiRepository();
