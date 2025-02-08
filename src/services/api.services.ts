import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const DOMAIN = import.meta.env.VITE_API_DOMAIN;
const PREFIX_URL = import.meta.env.VITE_API_PREFIX_URL;

interface ApiServiceConfig {
  portNumber: string;
  method: string;
  url: string;
  data?: any;
  params?: any;
  additionalHeaders?: Record<string, string>;
  usePrefix?: boolean;
  signal?: AbortSignal;
}

const ApiService = async <T = any>({
  portNumber,
  method,
  url,
  data = null,
  params = null,
  additionalHeaders = {},
  usePrefix = true,
  signal
}: ApiServiceConfig): Promise<T> => {
  const BASE_URL = usePrefix
    ? `${DOMAIN}:${portNumber}${PREFIX_URL}`
    : `${DOMAIN}:${portNumber}`;

  try {
    const token = sessionStorage?.getItem('token');
    const headers = {
      ...additionalHeaders,
      ...(token && { Authorization: `Bearer ${JSON.parse(token)}` }),
      ...(data instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : data
          ? { 'Content-Type': 'application/json' }
          : {}),
    };

    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 100000,
      headers,
    });

    const config: AxiosRequestConfig = { params, signal };

    const response: AxiosResponse<T> = await axiosInstance.request({
      url,
      method,
      data,
      ...config,
    });

    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled');
      throw error;
    }
    console.error(`Error in ${url}:`, error.message);
    throw error;
  }
};

export { ApiService, type ApiServiceConfig };