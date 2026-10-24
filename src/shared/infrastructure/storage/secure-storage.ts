import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'fmf_access_token';
const REFRESH_TOKEN_KEY = 'fmf_refresh_token';
const USER_KEY = 'fmf_user_data';
const INSTALLATION_ID_KEY = 'fmf_installation_id';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export class SecureStorageService {
  static async saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Error saving tokens to SecureStore:', error);
    }
  }

  static async getTokens(): Promise<StoredTokens | null> {
    try {
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error reading tokens from SecureStore:', error);
      return null;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Identificador estable de esta instalación de la app. Se genera una sola vez y
   * sobrevive a los cierres de sesión, porque identifica al dispositivo y no al usuario.
   *
   * Es necesario porque el backend distinguía los dispositivos por su modelo, y el
   * cliente enviaba una constante por plataforma ('Apple iPhone'): dos teléfonos del
   * mismo usuario colapsaban en un único registro y se invalidaban la sesión mutuamente.
   */
  static async getInstallationId(): Promise<string> {
    try {
      const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
      if (existing) {
        return existing;
      }

      const generated = generateInstallationId();
      await SecureStore.setItemAsync(INSTALLATION_ID_KEY, generated);
      return generated;
    } catch (error) {
      console.error('Error resolving installation id:', error);
      // Si el almacenamiento seguro falla, se devuelve un valor efímero: peor que
      // persistirlo, pero mejor que enviar un identificador compartido entre dispositivos.
      return generateInstallationId();
    }
  }

  /** Borra la sesión. El installation id se conserva: el dispositivo sigue siendo el mismo. */
  static async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error clearing SecureStore:', error);
    }
  }
}

function generateInstallationId(): string {
  const randomPart = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${randomPart()}-${randomPart()}`;
}
