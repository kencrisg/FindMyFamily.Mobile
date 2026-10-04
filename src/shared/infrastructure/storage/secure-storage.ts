import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'fmf_access_token';
const REFRESH_TOKEN_KEY = 'fmf_refresh_token';
const USER_KEY = 'fmf_user_data';

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
