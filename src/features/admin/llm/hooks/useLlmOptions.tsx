import { useMemo } from 'react';
import { useResource } from '@/hooks/api/useResource';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

// === Types ===
export interface LLMProvider {
  id: number;
  name: string;
}

export interface ModelName {
  id: number;
  name: string;
  provider: string;
  model_type: 'chat' | 'embeddings';
}

export interface LLMDataFilter {
  model_type: 'chat' | 'embeddings';
  provider?: string;
}

// Updated to match actual API response structure
export interface LLMDataItem {
  id: number;
  model_name: string;
  provider: string;
  model_type: 'chat' | 'embeddings';
  embedding_config: {
    input_type: string;
    max_tokens: number;
  };
  chat_config: any;
  created_at: string;
  updated_at: string;
  created_by: any;
  updated_by: any;
  is_deleted: any;
  deleted_by: any;
}

export interface LLMApiResponse {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: LLMDataItem[];
}

interface UseLlmOptionsParams {
  modelType?: 'chat' | 'embeddings';
  provider?: string;
}

interface UseLlmOptionsReturn {
  providers: LLMProvider[];
  modelNames: ModelName[];
  loading: {
    providers: boolean;
    models: boolean;
  };
  error: {
    providers: boolean;
    models: boolean;
  };
  refetch: {
    providers: () => void;
    models: () => void;
  };
}

export const useLlmOptions = ({ 
  modelType, 
  provider 
}: UseLlmOptionsParams = {}): UseLlmOptionsReturn => {
  const { getAll } = useResource<LLMApiResponse>(
    'bh_llms',
    CATALOG_REMOTE_API_URL,
    true
  );

  // Memoize query parameters to prevent unnecessary re-renders
  const providersParams = useMemo(() => 
    modelType ? { model_type: modelType } : null,
    [modelType]
  );

  const modelsParams = useMemo(() => 
    modelType && provider ? { model_type: modelType, provider } : null,
    [modelType, provider]
  );

  // Fetch providers when modelType is available
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    isError: isProvidersError,
    refetch: refetchProviders,
  } = getAll<LLMApiResponse>({
    url: 'bh_llms/list/',
    queryOptions: {
      enabled: !!modelType,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    params: providersParams,
  });

  // Fetch models when both modelType and provider are available
  const {
    data: modelsData,
    isLoading: isLoadingModels,
    isError: isModelsError,
    refetch: refetchModels,
  } = getAll<LLMApiResponse>({
    url: 'bh_llms/list/',
    queryOptions: {
      enabled: !!(modelType && provider),
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
    params: modelsParams,
  });
  
  // Extract unique providers from the API response
   const providers = useMemo(() => {
    if (!providersData?.data) return [];
    
    const uniqueProviders = new Map<string, LLMProvider>();
    
    // Use the actual LLM record ID as the provider ID
    providersData.data.forEach((item) => {
      if (!uniqueProviders.has(item.provider)) {
        uniqueProviders.set(item.provider, {
          id: item.id, // ✅ Use the actual LLM record ID from database
          name: item.provider,
        });
      }
    });
    
    return Array.from(uniqueProviders.values());
  }, [providersData?.data]);

  // Extract models from the API response
  const modelNames = useMemo(() => {
    if (!modelsData?.data) return [];
    
    return modelsData.data.map((item) => ({
      id: item.id,
      name: item.model_name,
      provider: item.provider,
      model_type: item.model_type,
    }));
  }, [modelsData?.data]);

  return {
    providers,
    modelNames,
    loading: {
      providers: isLoadingProviders,
      models: isLoadingModels,
    },
    error: {
      providers: isProvidersError,
      models: isModelsError,
    },
    refetch: {
      providers: refetchProviders,
      models: refetchModels,
    },
  } as const;
};
