import axios, { AxiosRequestConfig } from "axios";

const DOMAIN = import.meta.env.VITE_API_DOMAIN;
const PRIFIX_URL = import.meta.env.VITE_API_PREFIX_URL;

interface HeadersWithAuthorization extends AxiosRequestConfig {
  headers: {
    Authorization?: string;
    "Content-Type"?: string;
    [key: string]: any;
  };
}

const ApiService = async (
  PORT_NUMBER: string,
  method: string,
  url: string,
  data: any = null,
  params: any = null,
  additionalHeaders: Record<string, string> = {},
  usePrefix: boolean = true,
  signal?: AbortSignal
) => {
  const BASE_URL = usePrefix
    ? `${DOMAIN}:${PORT_NUMBER}${PRIFIX_URL}`
    : `${DOMAIN}:${PORT_NUMBER}`;
  try {
    let headers: HeadersWithAuthorization = { headers: {} };
    const token = sessionStorage?.getItem("token");

    // Add Authorization header if token exists
    if (token) {
      headers.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }

    // Merge additional headers
    headers.headers = { ...headers.headers, ...additionalHeaders };

    // Set Content-Type header
    if (data instanceof FormData) {
      headers.headers["Content-Type"] = "multipart/form-data";
    } else if (data && typeof data === "object" && !(data instanceof FormData)) {
      headers.headers["Content-Type"] = "application/json";
    }

    const axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 100000,
      headers: headers.headers,
    });

    const config: AxiosRequestConfig = { params, signal }; // Include signal

    let response;
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
      case "patch":
        response = await axiosInstance.patch(url, data, config);
        break;
      case "delete":
        response = await axiosInstance.delete(url, config);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log("Request canceled");
    } else {
      console.error(`Error in ${url}:`, error.message);
    }
    throw error;
  }
};

export { ApiService };
