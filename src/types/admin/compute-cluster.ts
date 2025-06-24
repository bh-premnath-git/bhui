export interface ComputeCluster {
  id: string;
  name: string;
  environment: string;
  platform: string;
  region: string;
  instanceType: string;
  minNodes: number;
  maxNodes: number;
  currentNodes: number;
  status: 'active' | 'inactive' | 'pending' | 'error';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

export interface ComputeClusterFormValues {
  name: string;
  environment: string;
  platform: string;
  region: string;
  instanceType: string;
  minNodes: number;
  maxNodes: number;
  tags: Array<{
    key: string;
    value: string;
  }>;
}

export interface ComputeClusterMutationData {
  name: string;
  environment: string;
  platform: string;
  region: string;
  instanceType: string;
  minNodes: number;
  maxNodes: number;
  tags?: {
    tagList: string;
  };
}