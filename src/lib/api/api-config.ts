
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
  portNumber: number;
  url: string;
  params?: Record<string, any>;
  method: string;
  data?: Record<string, any>;
  usePrefix?: boolean;
  metadata?: ApiMetadata;
  additionalHeaders?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export const API_BASE_URL = API_DOMAIN;
