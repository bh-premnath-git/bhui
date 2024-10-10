import axios, { AxiosRequestConfig } from "axios";

interface HeadersWithAuthorization extends AxiosRequestConfig {
  headers: {
    Authorization?: string;
    'Content-Type'?: string;
    [key: string]: any;
  };
}

const ApiService = async (
  PORT_NUMBER: string,
  method: string,
  url: string,
  data: any = null,
  params: any = null,
  additionalHeaders: Record<string, string> = {}
) => {
  //http://54.157.234.126:5000
  const DOMAIN = "http://54.157.234.126";
  const BASE_URL = `${DOMAIN}:${PORT_NUMBER}/api/v1`;

  try {
    let headers: HeadersWithAuthorization = { headers: {} };
    const token = sessionStorage?.getItem("token") ?? null;
    if (token) {
      headers.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }

    // Merge additional headers with existing headers
    headers.headers = { ...headers.headers, ...additionalHeaders };

    // Determine the content type based on the data
    if (data instanceof FormData) {
      headers.headers['Content-Type'] = 'multipart/form-data';
    } else if (data && typeof data === 'object' && !(data instanceof FormData)) {
      headers.headers['Content-Type'] = 'application/json';
    }

    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 100000,
      ...headers,
    });

    let response;
    const config: AxiosRequestConfig = { params };

    switch (method.toLowerCase()) {
      case "get":
        response = await axiosInstance.get(url, config);
        break;
      case "post":
        response = await axiosInstance.post(url, data, config);
        break;
      case "put":
        response = await axiosInstance.put(url, data, config);
        break;
      case "delete":
        response = await axiosInstance.delete(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error ${method.toUpperCase()}ing data at ${url}:`, error);
    throw error;
  }
};

export  {ApiService};