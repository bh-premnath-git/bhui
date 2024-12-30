import { useState, useEffect, useRef } from "react";
import { ApiService } from "@/services/apiServices";

interface UseApiOptions {
  method: "get" | "post" | "put" | "patch" | "delete";
  url: string;
  data?: any;
  params?: any;
  additionalHeaders?: Record<string, string>;
  usePrefix?: boolean;
  portNumber: string;
}

const useApi = ({
  method,
  url,
  data = null,
  params = null,
  additionalHeaders = {},
  usePrefix = true,
  portNumber,
}: UseApiOptions) => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Cancel the previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result = await ApiService(
        portNumber,
        method,
        url,
        data,
        params,
        additionalHeaders,
        usePrefix
      );
      setResponse(result);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [method, url, data, params, additionalHeaders, usePrefix, portNumber]);

  return { response, loading, error, refetch: fetchData };
};

export default useApi;
