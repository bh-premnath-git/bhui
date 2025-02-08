export interface Environment {
  id: number;
  name: string;
  cloud_provider: string;
  created_on: string;
  type: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive';
}

export interface EnvironmentTableProps {
  environments: Environment[];
}