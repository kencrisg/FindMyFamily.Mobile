export interface LocationCoordinate {
  id?: string;
  userId: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  accuracy?: number;
}

export interface LocationRequestResponse {
  requestId: string;
  targetUserId: string;
  status: string;
  message: string;
}

export interface ReportLocationPayload {
  latitude: number;
  longitude: number;
  capturedAt?: string;
}
