import { useMutation, useQuery } from '@tanstack/react-query';
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

export function useListDashboards() {
  return useQuery({
    queryKey: ['dashboardslist'],
    queryFn: async () => {
      const response = await apiService.get<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
        url: '/dashboard/list/?dashboard_type=explorer',
        method: 'GET'
      });
      
      return response.data;
    }
  });
}

export function useUpdateDashboard() {
  return useMutation({
    mutationFn: async (dashboard: any): Promise<any> => {
      const { dashboardId, ...rest } = dashboard;
      const response = await apiService.put<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
        url: `/dashboard/${dashboardId}/`,
        method: 'PATCH',
        data: rest
      });
      
      return response;
    }
  });
}

export function useDeleteDashboard() {
  return useMutation({
    mutationFn: async (dashboardId: string): Promise<any> => {
      const response = await apiService.delete<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
        url: `/dashboard/${dashboardId}/`,
        method: 'DELETE'
      });
      
      return response;
    }
  });
}

export function useGetDashboard(dashboardId: string) {
  return useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      const response = await apiService.get<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        usePrefix: true,
        url: `/dashboard/${dashboardId}/`,
        method: 'GET'
      });
      
      return response;
    }
  });
}