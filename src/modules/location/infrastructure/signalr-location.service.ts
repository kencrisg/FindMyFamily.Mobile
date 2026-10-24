import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../../../shared/infrastructure/api/api-client';
import { SecureStorageService } from '../../../shared/infrastructure/storage/secure-storage';
import { LocationCoordinate } from '../domain/entities/location.types';

/**
 * Nombre del evento que emite el backend (`SignalRLocationNotifier`). Debe coincidir
 * exactamente: el cliente escuchaba 'LocationReported' mientras el servidor emitía
 * 'LocationUpdated', de modo que ninguna actualización en tiempo real llegaba nunca.
 */
const LOCATION_UPDATED_EVENT = 'LocationUpdated';

export class SignalRLocationService {
  private connection: signalR.HubConnection | null = null;
  private onLocationReportedCallback: ((location: LocationCoordinate) => void) | null = null;

  async start(onLocationReported: (location: LocationCoordinate) => void): Promise<void> {
    this.onLocationReportedCallback = onLocationReported;

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const hubUrl = `${API_BASE_URL}/hubs/location`;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => {
          const token = await SecureStorageService.getAccessToken();
          return token || '';
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for backend real-time broadcast
    this.connection.on(LOCATION_UPDATED_EVENT, (data: {
      id: string;
      userId: string;
      latitude: number;
      longitude: number;
      capturedAt: string;
    }) => {
      if (this.onLocationReportedCallback) {
        this.onLocationReportedCallback({
          id: data.id,
          userId: data.userId,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          capturedAt: data.capturedAt,
        });
      }
    });

    try {
      await this.connection.start();
      console.log('Connected to LocationHub (SignalR)');
    } catch (err) {
      console.warn('Could not connect to SignalR LocationHub yet:', err);
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.warn('Error stopping SignalR connection:', err);
      }
      this.connection = null;
    }
  }
}

export const signalRLocationService = new SignalRLocationService();
