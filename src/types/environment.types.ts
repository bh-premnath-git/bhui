export interface Environment {
  bh_env_id: number;
  bh_env_name: string;
  cloud_provider_name: string;
  created_on: string;
  bh_env_provider_name: 'development' | 'staging' | 'production' | string;
  status: 'active' | 'inactive';
}

export interface EnvironmentTableProps {
  environments: Environment[];
}