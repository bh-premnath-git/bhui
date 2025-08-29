import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiConfig } from './api-config';
import {  API_PREFIX_URL, CATALOG_REMOTE_API_URL } from '@/config/platformenv';

const DEFAULT_API_PREFIX = API_PREFIX_URL;

interface ErrorResponse {
  message: string;
}

export interface MutationVariables<TData = unknown> {
  data?: TData | FormData;
  params?: Record<string, any>;
  url?: string;
  query?: string;
}

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
      timeout: 500000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use((config) => {
      // Get token from session storage with the correct key name
      const token = sessionStorage?.getItem('kc_token');
      if (token) {
        // Use the token directly without parsing as JSON
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      } else if (config.data) {
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (axios.isCancel(error)) {
          console.log('Request cancelled', (error as any).message);
          return Promise.reject(error);
        }

        if (isAxiosError<ErrorResponse>(error)) {
          const status = error.response?.status;
          const errorMessage = error.response?.data?.message || 'An error occurred';
          toast.error(`API Error: ${status} - ${errorMessage}`);
          return Promise.reject(error);
        }

        toast.error('Network connection error');
        return Promise.reject(new Error('Network error'));
      }
    );
  }

  private buildUrl(config: ApiConfig): string {
    let url = config.url;
    
    if (config.params?.flowId) {
      url = url.endsWith('/') ? url : url + '/';
      url = `${url}${config.params.flowId}`;
      const { flowId, ...restParams } = config.params;
      config.params = restParams;
    }
    
    return url;
  }

  private getUrl(config: ApiConfig): string {
    // prefer explicit baseUrl, else fall back to old DOMAIN+PREFIX logic
    const base = config.baseUrl
      ? config.baseUrl.replace(/\/$/, '') + (config.usePrefix ? DEFAULT_API_PREFIX : '') 
      : '';
  
    const path = this.buildUrl(config).replace(/^\//, '');
    let full = `${base}/${path}`;
  
    const paramsStr = new URLSearchParams(config.params || {}).toString();
    if (paramsStr) full += `?${paramsStr}`;
    if (config.query) {
      full += full.includes('?') ? `&${config.query}` : `?${config.query}`;
    }
    return full;
  }

  public async request<T>(config: ApiConfig): Promise<AxiosResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig = {
        url: this.getUrl(config),
        method: config.method,
        data: config.data,
        headers: config.additionalHeaders,
        signal: config.signal,
      };

      const response = await this.instance.request<T>(axiosConfig);
      if (config.metadata?.successMessage) {
        toast.success(config.metadata.successMessage);
      }
      return response;
    } catch (error) {
      if (config.metadata?.errorMessage) {
        toast.error(config.metadata.errorMessage);
      }
      throw error;
    }
  }

  /**
   * React Query GET helper
   */
  useApiQuery<TQueryFnData, TError, TData = TQueryFnData>(
    queryKey: string | string[],
    config: ApiConfig,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>
  ) {
    const queryFn = async () => {
      const { data } = await this.request<TQueryFnData>(config);
      return data;
    };

    return useQuery<TQueryFnData, TError, TData>({
      queryKey: typeof queryKey === 'string' ? [queryKey] : queryKey,
      queryFn,
      ...options,
      retry: (failureCount, error) => {
        if (axios.isCancel(error)) {
          return false;
        }
        return failureCount < 3;
      },
    });
  }

  
  useApiMutation<TResponse, TVariables = unknown>(
    initialConfig: ApiConfig,
    options?: Omit<UseMutationOptions<TResponse, Error, TVariables>, 'mutationFn'>
  ) {
    return useMutation<TResponse, Error, TVariables>({
      mutationFn: async (variables) => {
        const finalConfig: ApiConfig = {
          ...initialConfig,
          data:
            (variables as MutationVariables<any>)?.data ?? initialConfig.data,
          params:
            (variables as MutationVariables<any>)?.params ?? initialConfig.params,
            query:
            (variables as MutationVariables<any>)?.query ?? initialConfig.query,
          url:
            (variables as MutationVariables<any>)?.url ?? initialConfig.url,
        };

        const response = await this.request<TResponse>(finalConfig);
        return response.data;
      },
      ...options,
      onError: (error, variables, context) => {
        console.error('Mutation Error:', error);
        if (options?.onError) {
          options.onError(error, variables, context);
        } else {
          toast.error('Operation failed');
        }
      },
    });
  }

  // Standard REST methods (optional if you still need them)
  async get<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' }).then((res) => res.data);
  }

  async post<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST' }).then((res) => res.data);
  }

  async put<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT' }).then((res) => res.data);
  }

  async patch<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH' }).then((res) => res.data);
  }

  async delete<T>(config: ApiConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE' }).then((res) => res.data);
  }
  
}

export const apiService = new ApiService();
