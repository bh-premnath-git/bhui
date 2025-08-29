export interface Connection {
    id: number;
    connection_config_name: string;
    custom_metadata: object;
    connection_id: number;
    connection_name: string;
    connection_type: string;
    connection_status: string;
    data_residency: string;
    bh_env_id: number;
    config: string;
    init_vector: string;
    created_at: string;
};


export interface ConnectionTypes {
    id: number;
    connection_name: string;
    connection_display_name: string;
    connection_description: string;
    connection_type: string;
};

export interface ConnectionType {
    data: ConnectionTypes[];
}

export interface ConnectionValue {
    id?: string;
    connection_id: string;
    connection_type: string;
    connection_config_name: string;
    connection_name: string;
    connection_status: string;
    data_residency: string;
    bh_env_id: number;
    custom_metadata: Record<string, any>;
    init_vector: string;
    config: string;
    config_union?: {
      host: string;
      role: string;
      warehouse: string;
      database: string;
      schema: string;
      jdbc_url_params: string;
      credentials: {
        username: string;
        password: string;
        auth_type: string;
      };
      source_type: string;
    };
  }

export interface ConnectionPaginatedResponse {
  data: Connection[];
  total: number;
  offset: number;
  limit: number;
  prev: boolean;
  next: boolean;
}