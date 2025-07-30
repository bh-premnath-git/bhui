export enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export interface EnvironmentTags {
  [key: string]: string;
}

export interface Environment {
  created_at: string | null;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  is_deleted: boolean | null;
  deleted_by: number | null;
  bh_env_id: number;
  bh_env_name: string;
  bh_env_provider: number;
  cloud_provider_cd: number;
  cloud_region_cd: number;
  location: string | null;
  pvt_key: string | null;
  status: "active" | "inactive";
  tags: EnvironmentTags;
  project_id: string | null;
  airflow_url: string | null;
  airflow_bucket_name: string | null;
  airflow_env_name: string | null;
  access_key: string | null;
  bh_project_id: string | null;
  cloud_provider: string;
  cloud_provider_name: string;
  secret_access_key: string | null;
  cloud_provider_alias: string | null;
}


export type CreateEnvironmentDTO = Omit<
  Environment,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'deletedBy'
>;

export type UpdateEnvironmentDTO = Partial<CreateEnvironmentDTO>;


export function isValidEnvironmentType(type: string): type is EnvironmentType {
  return Object.values(EnvironmentType).includes(type as EnvironmentType);
}

export interface EnvironmentMutationData {
  bh_env_name: string;
  bh_env_type: string;
  cloud_provider: string;
  cloud_region: string;
  project_id: string;
  access_key: string;
  secret_access_key: string;
  pvt_key: string;
  airflow_env_url: string;
  airflow_env_type: string;
  airflow_bucket_name: string;
  airflow_env_name: string;
  status: "active" | "inactive";
  tags: { tagList: string };
  init_vector?: string;
}


export interface AWSValidationData {
  aws_access_key_id: string,
  aws_secret_access_key: string,
  init_vector: string,
  location: string,
  pvt_key?: string
};

export interface EnvironmentListResponse {
  data: Environment[];
  total: number;
  offset: number;
  limit: number;
  prev: boolean;
  next: boolean;
}

export type MWAAEnvironments = string[];

// Extended Environment type with bh_airflow array
export interface AirflowInstance {
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
  is_deleted: boolean;
  deleted_by: string | null;
  tenant_key: string;
  id: number;
  bh_env_id: number;
  airflow_env_type: string;
  airflow_env_name: string;
  airflow_env_url: string;
  airflow_env_version: string | null;
  airflow_env_status: string;
  airflow_bucket_name: string;
  airflow_tags: Record<string, any>;
}

export interface EnvironmentWithAirflow extends Omit<Environment, 'bh_env_id'> {
  bh_env_id: number;
  bh_env_name: string;
  bh_env_description: string | null;
  bh_env_type: string;
  bh_env_key: string;
  cloud_provider: string;
  status: string;
  aws_cloud_details?: {
    cloud_region: string;
    secrets_url: string | null;
  };
  gcp_cloud_details?: any;
  tags: {
    tagList: string;
  };
  bh_airflow: AirflowInstance[];
}