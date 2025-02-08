import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiService } from '@/services/api.services';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface QueryMetadata extends Record<string, unknown> {
  errorMessage?: string;
  successMessage?: string;
}

interface MutateDataParams {
  portNumber: string;
  url: string;
  additionalHeaders?: Record<string, string>;
  usePrefix?: boolean;
  metadata?: QueryMetadata;
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError<ApiError>) => void;
}

const useMutateData = <TData = any, TVariables = any>(
  method: string,
  {
    portNumber,
    url,
    additionalHeaders,
    usePrefix = true,
    metadata,
    onSuccess,
    onError,
  }: MutateDataParams
) => {
  return useMutation<TData, AxiosError<ApiError>, TVariables>({
    mutationFn: (data: TVariables) =>
      ApiService<TData>({
        portNumber,
        method,
        url,
        data,
        additionalHeaders,
        usePrefix,
      }),
    meta: metadata as Record<string, unknown>,
    onSuccess: (data) => {
      if (metadata?.successMessage) {
        toast.success(metadata.successMessage);
      }
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(
        metadata?.errorMessage ||
          error.response?.data?.message ||
          error.message
      );
      onError?.(error);
    },
  });
};

export { useMutateData };
