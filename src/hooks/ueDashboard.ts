import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

// Interface for create dashboard request
interface CreateDashboardRequest {
  name: string;
  dashboard_type: string;
}


export function useCreateDashboard() {
  return useMutation({
    mutationFn: async (dashboard: CreateDashboardRequest): Promise<any> => {
      const response = await apiService.post<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
        url: '/dashboard',
        method: 'POST',
        data: dashboard
      });
      
      return response;
    }
  });
}