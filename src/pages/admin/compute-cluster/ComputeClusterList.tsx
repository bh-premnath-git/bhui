import { ComputeClusterList } from '@/features/admin/compute-cluster/ComputeCluster';
import { ComputeCluster } from '@/types/admin/compute-cluster';

// Mock data for now - replace with actual API call
const mockClusters: ComputeCluster[] = [
  {
    id: '1',
    name: 'prod-cluster-01',
    environment: 'Production',
    platform: 'AWS',
    region: 'us-east-1',
    instanceType: 'm5.large',
    minNodes: 2,
    maxNodes: 10,
    currentNodes: 4,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    createdBy: 'admin@company.com',
    tags: [
      { key: 'Environment', value: 'Production' },
      { key: 'Team', value: 'DataOps' }
    ]
  },
  {
    id: '2',
    name: 'dev-cluster-01',
    environment: 'Development',
    platform: 'AWS',
    region: 'us-west-2',
    instanceType: 't3.medium',
    minNodes: 1,
    maxNodes: 5,
    currentNodes: 2,
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
    createdBy: 'dev@company.com',
    tags: [
      { key: 'Environment', value: 'Development' },
      { key: 'Team', value: 'Engineering' }
    ]
  },
  {
    id: '3',
    name: 'staging-cluster-01',
    environment: 'Staging',
    platform: 'AWS',
    region: 'eu-west-1',
    instanceType: 'm5.medium',
    minNodes: 1,
    maxNodes: 8,
    currentNodes: 3,
    status: 'pending',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    createdBy: 'staging@company.com',
    tags: [
      { key: 'Environment', value: 'Staging' }
    ]
  }
];

export default function ComputeClusterListPage() {
  return ( <div className="p-6">
        <div className="relative">
          {/* {isFetching && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
              <LoadingState className="w-40 h-40" />
            </div>
          )} */}
         <ComputeClusterList clusters={mockClusters} />
        </div>
      </div>);
}