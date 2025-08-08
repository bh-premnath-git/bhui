export interface LLM {
    id: number;
    llm_id: number;
    model_name: string;
    provider: string;
    model_type: string; // could be 'chat' | 'embedding' etc.
  
    default_embedding_config?: LLMEmbeddingConfig;
    default_chat_config?: LLMChatConfig;
  
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
    is_deleted: boolean;
    deleted_by: string;
    tenant_key: string;
  }
  
  export interface LLMPaginatedResponse {
    total: number;
    next: boolean;
    prev: boolean;
    offset: number;
    limit: number;
    data: LLM[];
  }
  
  export interface LLMMutationCreate {
    llm_id: number; // ID required for creation
    default_embedding_config?: LLMEmbeddingConfig;
    default_chat_config?: LLMChatConfig;
    llm_secret_url?: string; // optional secure URL
    api_key: string;
    init_vector: string;
  }
  
  export interface LLMMutationUpdate {
    default_embedding_config?: LLMEmbeddingConfig;
    default_chat_config?: LLMChatConfig;
    api_key: string;
    init_vector: string;
  }
  
  export interface LLMChatConfig {
    input_type: 'text' | string;
    max_tokens: number;
    temperature: number;
    timeout: number;
    max_retries: number;
  }
  
  export interface LLMEmbeddingConfig {
    input_type: 'text' | string;
    max_tokens: number;
  }
  
  export interface LLMConfig {
    llm_id: number;
    default_embedding_config?: LLMEmbeddingConfig;
    default_chat_config?: LLMChatConfig;
    llm_secret_url?: string;
    api_key: string;
  }
  
  
  export interface LLMMutationData {
    llm_id?: number; // optional in update, required in create
    provider: string;
    model_name: string;
    model_type: 'chat' | 'embeddings';
  
    api_key: string;
    init_vector: string;
  
    default_embedding_config?: LLMEmbeddingConfig;
    default_chat_config?: LLMChatConfig;
  
    llm_secret_url?: string;
  }  