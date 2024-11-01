import axios, { AxiosRequestConfig } from "axios";
const DOMAIN = import.meta.env.VITE_API_DOMAIN;
const PRIFIX_URL = import.meta.env.VITE_API_PREFIX_URL;
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
  const BASE_URL = `${DOMAIN}:${PORT_NUMBER}${PRIFIX_URL}`;
  try {
    let headers: HeadersWithAuthorization = { headers: {} };
    const token = sessionStorage?.getItem("token");

    // Add the token to Authorization header if it exists
    if (token) {
      headers.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }

    // Merge any additional headers
    headers.headers = { ...headers.headers, ...additionalHeaders };

    // Determine content type if necessary
    if (data instanceof FormData) {
      headers.headers['Content-Type'] = 'multipart/form-data';
    } else if (data && typeof data === 'object' && !(data instanceof FormData)) {
      headers.headers['Content-Type'] = 'application/json';
    }

    // Create axios instance with the base URL and headers
    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 100000,
      headers: headers.headers,  // Use only the headers part, not the full object
    });

    let response;
    const config: AxiosRequestConfig = { params };

    // Make request based on the method type
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
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      console.error(
        `Error ${method.toUpperCase()}ing data at ${url}:`, 
        error.response.data
      );
    } else if (error.request) {
      console.error(
        `No response received from ${url}:`, 
        error.request
      );
    } else {
      console.error(
        `Error in request setup for ${url}:`, 
        error.message
      );
    }
    throw error;
  }
};

export { ApiService };
