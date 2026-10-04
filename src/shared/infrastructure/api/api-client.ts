import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { SecureStorageService } from '../storage/secure-storage';

// Default localhost config based on platform (Android emulator vs iOS simulator / physical device)
const DEFAULT_DEV_HOST = Platform.select({
  android: 'http://10.0.2.2:5122',
  ios: 'http://localhost:5122',
  default: 'http://localhost:5122',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_HOST;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh calls simultaneously
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStorageService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Silent Token Rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry if the 401 was on the refresh-token endpoint itself or login
    if (originalRequest.url?.includes('/api/auth/refresh-token') || originalRequest.url?.includes('/api/auth/login')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storedTokens = await SecureStorageService.getTokens();
      if (!storedTokens?.refreshToken || !storedTokens?.accessToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh-token endpoint
      const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
        accessToken: storedTokens.accessToken,
        refreshToken: storedTokens.refreshToken,
      });

      const newTokens = refreshResponse.data as {
        accessToken: string;
        refreshToken: string;
      };

      await SecureStorageService.saveTokens(newTokens);
      processQueue(null, newTokens.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      await SecureStorageService.clearAll();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
