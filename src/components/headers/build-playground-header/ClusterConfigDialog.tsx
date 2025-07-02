import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Cloud, Power, Server, Trash2, Link, AlertTriangle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { usePipelineContext } from '@/context/designers/DataPipelineContext';

interface Environment {
  bh_env_id: number;
  bh_env_name: string;
  bh_env_provider_name: string;
  cloud_provider_name: string;
  status: string;
}

interface Cluster {
  id: string;
  name: string;
  status: {
    State: string;
    StateChangeReason?: {
      Message: string;
    };
    Timeline: {
      CreationDateTime: string;
    };
  };
  master_dns?: string;
  master_ip?: string | null;
  tags?: Array<{
    Key: string;
    Value: string;
  }>;
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
  const [selectedClusterConfig, setSelectedClusterConfig] = useState<string>("");
  const [clusterConfigs, setClusterConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(false);
  const [isLoadingClusters, setIsLoadingClusters] = useState(false);
  const [isLoadingClusterConfigs, setIsLoadingClusterConfigs] = useState(false);
  const [terminatingClusters, setTerminatingClusters] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState<{id: string, name: string} | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { clusters, loading, error } = useSelector((state:RootState) => state.cluster);
  const { attachCluster, attachedCluster, detachCluster } = usePipelineContext();

  // Fetch environments on component mount
  useEffect(() => {
    fetchEnvironments();
    fetchClusterConfigs();
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
        params: { offset: 0, limit: 10, order_desc: true }
      });
      console.log(response)
      setEnvironments(response || {});
      if (response?.data?.length > 0) {
        setSelectedEnvId(response.data[0].bh_env_id.toString());
      }
    } catch (error) {
      toast.error("Failed to fetch environments");
    } finally {
      setIsLoadingEnvironments(false);
    }
  };

  const fetchClusterConfigs = async () => {
    setIsLoadingClusterConfigs(true);
    try {
      const response:any = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_compute/bh-compute-config/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch cluster configs'
        },
        params: { offset: 0, limit: 1000, order_by: 'created_at', order_desc: true }
      });
      setClusterConfigs(response.data);
      if (response.data.length > 0) {
        setSelectedClusterConfig(response.data[0].compute_config_id.toString());
      }
    } catch (error) {
      toast.error("Failed to fetch cluster configurations");
    } finally {
      setIsLoadingClusterConfigs(false);
    }
  };

  const handleCreateCluster = async () => {
    if (!selectedClusterConfig) {
      toast.error("Please select a cluster configuration");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating cluster with config:', selectedClusterConfig, 'and name:', clusterName);
      
      const response = await apiService.post({
  baseUrl: CATALOG_REMOTE_API_URL,
  url: '/bh_compute/create-cluster',
  usePrefix: true,
  method: 'POST',
  params: {
    compute_config_id: selectedClusterConfig,
    cluster_name: clusterName, // Uncomment if needed
  },
  data: [
    {
      Key: 'bh_cluster',
      Value: 'true',
    },
  ],
});


      console.log('Create cluster response:', response);
      toast.success("Cluster creation initiated successfully!");
      
      // Reset form and close create dialog
      setClusterName("");
      setSelectedClusterConfig("");
      setShowCreateForm(false);
      
      // Refresh clusters list
      if (selectedEnvId) {
        dispatch(fetchClusters({ bh_env_id: selectedEnvId, region: "us-east-1" }));
      }
      
    } catch (error: any) {
      console.error('Failed to create cluster:', error);
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || error?.message 
        || 'Failed to create cluster. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetachCluster = (clusterId: string, clusterName: string) => {
    setClusterToDelete({ id: clusterId, name: clusterName });
    setShowConfirmDialog(true);
  };

  const confirmClusterDeletion = async () => {
    if (!clusterToDelete) return;

    try {
      let result = await dispatch(terminateCluster({
        clusterId: clusterToDelete.id,
        bh_env_id: selectedEnvId,
        region: "us-east-1"
      })).unwrap();
      
      if (result) {
        toast.success("Cluster termination initiated successfully!");
        dispatch(fetchClusters({ bh_env_id: selectedEnvId, region: "us-east-1" }));
      }
    } catch (error) {
      toast.error("Failed to terminate cluster. Please try again.");
      console.error("Error terminating cluster:", error);
    } finally {
      setShowConfirmDialog(false);
      setClusterToDelete(null);
    }
  };

  const cancelClusterDeletion = () => {
    setShowConfirmDialog(false);
    setClusterToDelete(null);
  };

  const handleAttachCluster = (cluster: any) => {
    attachCluster(cluster);
    toast.success(`Cluster "${cluster.name}" attached successfully!`);
  };

  const handleDetachClusterFromPipeline = () => {
    detachCluster();
    toast.success("Cluster detached from pipeline successfully!");
  };

  return (
    <div className="space-y-6 p-2">
      {/* Currently Attached Cluster Section - Only show if clusters exist */}
      {attachedCluster && clusters.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Currently Attached Cluster
              </h3>
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {attachedCluster.name}
                </span>
                <span className="text-xs text-green-600">
                  ({attachedCluster.master_ip})
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Status: {attachedCluster.status?.State || 'Unknown'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetachClusterFromPipeline}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Detach
            </Button>
          </div>
        </div>
      )}
      
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
          <SelectContent style={{zIndex: 9999}}>
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
              <h3 className="text-lg font-semibold text-gray-900">Active Computes</h3>
              
            {/* </div> */}
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-4">
              {isLoadingClusters ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading computes...</p>
                </div>
              ) : (
                <>
                  {clusters.map((cluster:any) => (
                    <div
                      key={cluster.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Server className={cn({"h-6 w-6 text-green-600": cluster.status.State === 'RUNNING'||cluster.status.State === 'WAITING', "h-6 w-6 text-orange-600": cluster.status.State === 'STARTING'|| cluster.status.State === 'BOOTSTRAPPING'})} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{cluster.name}</p>
                          <p className="text-sm text-gray-600">
                            {cluster.status.State.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Created {new Date(cluster.status.Timeline.CreationDateTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Only show attach/detach functionality if clusters exist */}
                        {clusters.length > 0 && (
                          <>
                            {/* Show attach button if not currently attached, or show attached indicator */}
                            {attachedCluster?.id === cluster.id ? (
                              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <Link className="h-4 w-4" />
                                <span>Attached</span>
                              </div>
                            ) : (
                              <>
                              {
                               (cluster.status.State === 'WAITING'|| cluster.status.State === 'RUNNING') && (<Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttachCluster(cluster)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Link className="h-4 w-4" />
                              </Button>)
                              }
                              </>
                            )}
                            
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleDetachCluster(cluster.id, cluster.name)}
                              disabled={terminatingClusters.has(cluster.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              {terminatingClusters.has(cluster.id) ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {clusters.length === 0 && (
                    <div className="text-center py-12">
                      <Server className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No compute found</p>
                      <p className="text-gray-400 text-sm">Create a new compute to get started</p>
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
              <Label className="text-sm font-medium text-gray-700 block mb-2">
                Cluster Configuration<span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Select onValueChange={setSelectedClusterConfig} value={selectedClusterConfig} disabled={isLoadingClusterConfigs}>
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-gray-300 transition-colors">
                  {isLoadingClusterConfigs ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading clusters...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select Compute Configuration" />
                  )}
                </SelectTrigger>
                <SelectContent style={{zIndex: 9999}} className="max-h-60">
                  {clusterConfigs.map((config) => (
                    <SelectItem key={config.compute_config_id} value={config.compute_config_id.toString()}>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">{config.compute_config_name}</span>
                          <span className="text-xs text-gray-500">
                            {config.compute_type} • {config.compute_config.instance_type} • {config.compute_config.worker_count} workers
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Cluster Termination
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone!
              </p>
            </div>
            <p className="text-gray-700 mb-2">
              Are you sure you want to terminate the cluster:
            </p>
            <p className="font-semibold text-gray-900 mb-3">
              "{clusterToDelete?.name}"
            </p>
            <p className="text-sm text-gray-600">
              This will permanently delete the cluster and all its data. All running jobs will be terminated.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelClusterDeletion}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClusterDeletion}
              className="flex-1"
            >
              Yes, Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 