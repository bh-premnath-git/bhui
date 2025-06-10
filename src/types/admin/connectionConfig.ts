// src/types/admin/connectionConfigs.ts
export interface BaseConnectionConfig {
    source_type: string;
  }
  
  export interface SnowflakeConnectionConfig extends BaseConnectionConfig {
    host: string;
    role: string;
    warehouse: string;
    database: string;
    schema?: string;
    jdbc_url_params?: string;
    credentials: {
      username: string;
      password: string;
      auth_type: string;
    };
  }
  
  export interface BigQueryConnectionConfig extends BaseConnectionConfig {
    project_id: string;
    dataset_id?: string;
    credentials_json: string;
  }
  
  export interface PostgresConnectionConfig extends BaseConnectionConfig {
    host: string;
    port: number;
    database?: string;
    username: string;
    password: string;
    db_schema?: string;
  }
  
  export interface MySQLConnectionConfig extends BaseConnectionConfig {
    host: string;
    port: number;
    database?: string;
    username: string;
    password: string;
    db_schema?: string;
  }
  
  export interface OracleConnectionConfig extends BaseConnectionConfig {
    host: string;
    port: number;
    service_name?: string;
    sid?: string;
    username: string;
    password: string;
    schema?: string;
  }