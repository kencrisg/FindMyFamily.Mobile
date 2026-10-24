export interface LocationCoordinate {
  id?: string;
  userId: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  accuracy?: number;
}

/** Estados que devuelve POST /api/locations/request. */
export type LocationRequestStatus = 'REQUESTED' | 'UNAVAILABLE';

export interface LocationRequestResponse {
  /** null cuando el familiar es inalcanzable: no se llegó a crear ninguna petición. */
  requestId: string | null;
  targetUserId: string;
  status: LocationRequestStatus;
  message: string;
  /** Última posición conocida. Es lo que se pinta cuando el familiar está offline. */
  lastKnownLocation: LocationCoordinate | null;
}

export interface ReportLocationPayload {
  latitude: number;
  longitude: number;
  capturedAt?: string;
}
