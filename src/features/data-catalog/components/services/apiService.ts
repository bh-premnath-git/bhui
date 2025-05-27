import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";
import { apiService } from "@/lib/api/api-service";

export const mockApiCall = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

export const saveDescription = async (id: number, description: string) => {
  return apiService.patch({
    baseUrl: CATALOG_REMOTE_API_URL,
    url: `/data_source/${id}`,
    data: {data_src_desc : description },
    usePrefix: true,
    method: 'PATCH',
    metadata: {
      errorMessage: 'Failed to save description'
    }
  });
};