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

    if (this.connection) {
      const { state } = this.connection;
      // Conectada o recuperándose sola: no hay nada que hacer.
      if (
        state === signalR.HubConnectionState.Connected ||
        state === signalR.HubConnectionState.Connecting ||
        state === signalR.HubConnectionState.Reconnecting
      ) {
        return;
      }
      // Caída del todo (la reconexión automática se rindió, o nunca llegó a conectar): se
      // descarta antes de crear otra, para no dejar conexiones huérfanas.
      await this.stop();
    }

    const token = await SecureStorageService.getAccessToken();
    if (!token) {
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
      .configureLogging(signalR.LogLevel.None)
      .build();

    // Aumentar el timeout para emuladores locales y evitar desconexiones prematuras
    this.connection.serverTimeoutInMilliseconds = 60000;
    this.connection.keepAliveIntervalInMilliseconds = 15000;

    // `onclose` solo llega cuando la reconexión automática ya se ha rendido: a partir de
    // aquí no se reconecta sola. La siguiente petición de ubicación vuelve a llamar a
    // start(), que crea una conexión nueva.
    this.connection.onclose((error) => {
      if (error) {
        console.log('[SignalR] Conexión perdida; se reconectará en la próxima petición.', error.message);
      }
    });

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
