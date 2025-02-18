import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { ApiConfig, API_BASE_URL } from './api-config';

interface ErrorResponse {
  message: string;
}

// Custom type guard for AxiosError with generics
function isAxiosError<T = any>(error: unknown): error is AxiosError<T> {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as AxiosError<T>).isAxiosError === true
  );
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use((config) => {
      const token = sessionStorage?.getItem('token');

      if (token) {
        config.headers.set('Authorization', `Bearer ${JSON.parse(token)}`);
      }

      if (config.data instanceof FormData) {
        config.headers.set('Content-Type', 'multipart/form-data');
      } else if (config.data) {
        config.headers.set('Content-Type', 'application/json');
      }

      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (isAxiosError<ErrorResponse>(error)) {
          if (axios.isCancel(error)) {
            return Promise.reject(error);
          }

          return Promise.reject(error);
        }

        toast.error('Network connection error');
        return Promise.reject(new Error('Network error'));
      }
    );
  }

  private getUrl(config: ApiConfig): string {
    const baseUrl = `${API_BASE_URL}:${config.portNumber}`;
    return config.usePrefix ? `${baseUrl}/api/v1${config.url}` : `${baseUrl}${config.url}`;
  }

  private async request<T>(config: ApiConfig): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      url: this.getUrl(config),
      method: config.method,
      params: config.params,
      data: config.data,
      metadata: config.metadata,
    };

    try {
      const response = await this.instance.request<T>(axiosConfig);
      if (config.metadata?.successMessage) {
        toast.success(config.metadata.successMessage);
      }
      return response.data;
    } catch (error) {
      if (config.metadata?.errorMessage) {
        toast.error(config.metadata.errorMessage);
      }
      throw error;
    }
  }

  async get<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' });
  }

  async post<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST' });
  }

  async put<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT' });
  }

  async patch<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH' });
  }

  async delete<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
