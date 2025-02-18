
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { ApiConfig } from '@/lib/api/api-config';
import { apiService } from '@/lib/api/api-service';

export function useApiQuery<T>(
  queryKey: string[],
  config: ApiConfig,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn: () => apiService.get<T>(config),
    ...options,
  });
}

export function useApiMutation<T>(
  config: ApiConfig,
  options?: UseMutationOptions<T, Error, any>
) {
  const mutationFn = (data: any) => {
    const mutationConfig = { ...config, data };
    switch (config.method.toUpperCase()) {
      case 'POST':
        return apiService.post<T>(mutationConfig);
      case 'PUT':
        return apiService.put<T>(mutationConfig);
      case 'PATCH':
        return apiService.patch<T>(mutationConfig);
      case 'DELETE':
        return apiService.delete<T>(mutationConfig);
      default:
        throw new Error(`Unsupported method: ${config.method}`);
    }
  };

  return useMutation({
    mutationFn,
    ...options,
  });
}
