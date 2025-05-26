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
  baseUrl?: string;
  url: string;   
  method: string;
  data?: string | Record<string, any> | FormData;
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
