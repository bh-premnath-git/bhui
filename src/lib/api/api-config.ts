
import { API_DOMAIN } from '@/config/platformenv';

export interface ApiMetadata {
  errorMessage?: string;
  successMessage?: string;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: ApiMetadata;
  }
}

export interface ApiConfig {
  portNumber?: string;
  method: string;
  url: string;
  data?: Record<string, any> | FormData;
  params?: Record<string, any>;
  query?: string;
  additionalHeaders?: Record<string, string>;
  usePrefix?: boolean;
  signal?: AbortSignal;
  metadata?: ApiMetadata;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const API_BASE_URL = API_DOMAIN;
