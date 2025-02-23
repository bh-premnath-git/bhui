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
    created_by: string | null;
    updated_by: string | null;
    is_deleted: boolean;
    deleted_by: string | null;
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
    bh_env_provider_name: string;
    cloud_provider_name: string;
    secret_access_key: string | null;
}
  
  export type CreateEnvironmentDTO = Omit<
    Environment,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted' | 'deletedBy'
  >;
  
  export type UpdateEnvironmentDTO = Partial<CreateEnvironmentDTO>;
  
  export type EnvironmentMutationData = Omit<Environment, 'id' | 'createdAt' | 'updatedAt'>;
  
  export function isValidEnvironmentType(type: string): type is EnvironmentType {
    return Object.values(EnvironmentType).includes(type as EnvironmentType);
  }