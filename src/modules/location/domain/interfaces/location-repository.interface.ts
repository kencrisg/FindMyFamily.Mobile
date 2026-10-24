import {
  LocationCoordinate,
  LocationRequestResponse,
  ReportLocationPayload,
} from '../entities/location.types';

export interface ILocationRepository {
  requestLocation(targetUserId: string, familyId: string): Promise<LocationRequestResponse>;
  reportLocation(payload: ReportLocationPayload): Promise<LocationCoordinate>;
  getLatestLocation(familyId: string, userId: string): Promise<LocationCoordinate | null>;
}
