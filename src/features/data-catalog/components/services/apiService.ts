import { CATALOG_API_PORT } from "@/config/platformenv";
import { apiService } from "@/lib/api/api-service";

export const mockApiCall = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
};

export const saveDescription = async (id: number, description: string) => {
  return apiService.patch({
    portNumber: CATALOG_API_PORT,
    url: `/data_source/${id}`,
    data: {data_src_desc : description },
    usePrefix: true,
    method: 'PATCH',
    metadata: {
      errorMessage: 'Failed to save description'
    }
  });
};