import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

export interface PipelineChatMessage {
  id?: string;
  role: string;
  content: string;
  timestamp: string;
  suggestions?: any[];
  formData?: {
    schema?: any;
    sourceColumns?: any[];
    currentNodeId?: string;
    initialValues?: any;
    isTarget?: boolean;
  };
}

export interface PipelineChatHistoryPayload {
  pipeline_id: string;
  messages: PipelineChatMessage[];
  append?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function savePipelineChatHistory(
  pipelineId: string,
  chatHistoryData: PipelineChatHistoryPayload
): Promise<any> {
  return apiService.post<any>({
    baseUrl: CATALOG_REMOTE_API_URL,
    url: `/api/v1/pipeline/${pipelineId}/chat-history`,
    data: chatHistoryData,
    metadata: {
      successMessage: 'Chat history saved successfully',
      errorMessage: 'Failed to save chat history',
    },
  });
}

export async function getPipelineChatHistory(pipelineId: string): Promise<any> {
  return apiService.get<any>({
    baseUrl: CATALOG_REMOTE_API_URL,
    url: `/api/v1/pipeline/${pipelineId}/chat-history`,
  });
}

export async function deletePipelineChatHistory(pipelineId: string): Promise<any> {
  return apiService.delete<any>({
    baseUrl: CATALOG_REMOTE_API_URL,
    url: `/api/v1/pipeline/${pipelineId}/chat-history`,
    metadata: {
      successMessage: 'Chat history deleted successfully',
      errorMessage: 'Failed to delete chat history',
    },
  });
}