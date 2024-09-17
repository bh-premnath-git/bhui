import axios, { AxiosRequestConfig } from "axios";

interface HeadersWithAuthorization extends AxiosRequestConfig {
  headers: {
    Authorization?: string;
    [key: string]: any; // Allow other headers
  };
}

const ApiService = async (
  PORT_NUMBER: string,
  method: string,
  url: string,
  data: any = null,
  params: any = null,
  additionalHeaders: Record<string, string> = {} // Optional headers
) => {
  const DOMAIN = "http://localhost";
  const BASE_URL = `${DOMAIN}:${PORT_NUMBER}/api/v1`;

  try {
    let headers: HeadersWithAuthorization = { headers: {} };
    const token = sessionStorage?.getItem("token") ?? null;
    if (token) {
      headers.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }

    // Merge additional headers with existing headers
    headers.headers = { ...headers.headers, ...additionalHeaders };

    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 100000,
      ...headers,
    });

    let response;
    switch (method.toLowerCase()) {
      case "get":
        response = await axiosInstance.get(url, { params });
        break;
      case "post":
        response = await axiosInstance.post(url, data);
        break;
      case "put":
        response = await axiosInstance.put(url, data);
        break;
      case "delete":
        response = await axiosInstance.delete(url);
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

export default ApiService;
