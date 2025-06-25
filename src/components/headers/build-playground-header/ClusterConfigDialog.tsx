import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Cloud, Power, Server, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchClusters, 
  createCluster, 
  terminateCluster 
} from '@/store/slices/designer/buildPipeLine/clusterSlice';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface Environment {
  bh_env_id: number;
  bh_env_name: string;
  bh_env_provider_name: string;
  cloud_provider_name: string;
  status: string;
}

interface Cluster {
  Id: string;
  Name: string;
  Status: {
    State: string;
    StateChangeReason?: {
      Message: string;
    };
    Timeline: {
      CreationDateTime: string;
    };
  };
}

interface ClusterConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClusterConfigDialog: React.FC<any> = () => {
  const [environments, setEnvironments] = useState<any>([]);
  const [selectedEnvId, setSelectedEnvId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clusterName, setClusterName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(false);
  const [isLoadingClusters, setIsLoadingClusters] = useState(false);
  const [terminatingClusters, setTerminatingClusters] = useState<Set<string>>(new Set());
  const dispatch = useDispatch<AppDispatch>();
  const { clusters, loading, error } = useSelector((state:RootState) => state.cluster);

  // Fetch environments on component mount
  useEffect(() => {
    fetchEnvironments();
  }, []);

  // Fetch clusters when environment changes
  useEffect(() => {
    if (selectedEnvId) {
      dispatch(fetchClusters({ bh_env_id: selectedEnvId, region: "us-east-1" }));
    }
  }, [selectedEnvId, dispatch]);

  const fetchEnvironments = async () => {
    setIsLoadingEnvironments(true);
    try {
      const response:any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/environment/environment/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch data sources'
        },
        params: { offset: 0, limit: 10, order_desc: false }
      });
      setEnvironments(response);
      if (response.length > 0) {
        setSelectedEnvId(response[0].bh_env_id.toString());
      }
    } catch (error) {
      toast.error("Failed to fetch environments");
    } finally {
      setIsLoadingEnvironments(false);
    }
  };

  const handleCreateCluster = async () => {
    if (!clusterName.trim()) {
      toast.error("Please enter a cluster name");
      return;
    }

    dispatch(createCluster({
      cluster_name: clusterName,
      bh_env_id: selectedEnvId,
      region: "us-east-1"
    }));
  };

  const handleDetachCluster = async (clusterId: string) => {
    dispatch(terminateCluster({
      clusterId,
      bh_env_id: selectedEnvId,
      region: "us-east-1"
    }));
  };

  return (
    <div className="space-y-6 p-2">
      <div>
        <Label className="text-sm font-semibold text-[#1C1C1C] mb-2 block">
          Environment<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Select onValueChange={setSelectedEnvId} value={selectedEnvId} disabled={isLoadingEnvironments}>
          <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 transition-colors">
            {isLoadingEnvironments ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading environments...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select Environment" />
            )}
          </SelectTrigger>
          <SelectContent>
            {environments.data?.map((env:any) => (
              <SelectItem key={env.bh_env_id} value={env.bh_env_id.toString()}>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{env.bh_env_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {env.cloud_provider_name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!showCreateForm ? (
        <div className="rounded-xl bg-white ">
          <div className="border-b border-gray-100">
            {/* <div className="flex justify-between items-center"> */}
              <h3 className="text-lg font-semibold text-gray-900">Active Clusters</h3>
              
            {/* </div> */}
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-4">
              {isLoadingClusters ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading clusters...</p>
                </div>
              ) : (
                <>
                  {clusters.map((cluster) => (
                    <div
                      key={cluster.Id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Server className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{cluster.Name}</p>
                          <p className="text-sm text-gray-500">
                            Created {new Date(cluster.Status.Timeline.CreationDateTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                          cluster.Status.State === 'RUNNING' ? 'bg-green-100 text-green-700' :
                          cluster.Status.State === 'STARTING' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {cluster.Status.State === 'RUNNING' && <CheckCircle className="h-4 w-4" />}
                          {cluster.Status.State === 'STARTING' && <Power className="h-4 w-4" />}
                          {cluster.Status.State === 'ERROR' && <AlertCircle className="h-4 w-4" />}
                          {cluster.Status.State}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetachCluster(cluster.Id)}
                          disabled={terminatingClusters.has(cluster.Id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {terminatingClusters.has(cluster.Id) ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {clusters.length === 0 && (
                    <div className="text-center py-12">
                      <Server className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No clusters found</p>
                      <p className="text-gray-400 text-sm">Create a new cluster to get started</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          <div className='text-center'>
          <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-800 hover:bg-gray-950 transition-colors shadow-sm"
              >
                Create New Cluster
              </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 rounded-xl bg-white ">
          <div className="border-b pb-2">
            <h3 className="text-xl font-semibold text-gray-900">Create New Cluster</h3>
            <p className="text-gray-500 text-sm mt-1">Configure your new cluster settings</p>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-1">Cluster Name</Label>
              <Input
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="Enter cluster name"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 block mb-2">Region</Label>
              <Input 
                value="us-east-1" 
                disabled 
                className="bg-gray-50 border-gray-200 text-gray-500"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gray-800 hover:bg-gray-950"
                onClick={handleCreateCluster}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Cluster"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 