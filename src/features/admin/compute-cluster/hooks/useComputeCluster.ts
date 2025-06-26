import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api/api-service';
import { ComputeClusterFormValues } from '../components/computeClusterFormSchema';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

interface ComputeTypesResponse {
  compute_types: string[];
}

interface ComputeConfigSchemaResponse {
  $defs?: Record<string, any>;
  properties: Record<string, any>;
  required: string[];
  title: string;
  type: string;
}

interface ComputeClusterApiResponse {
  compute_config_name: string;
  compute_type: string;
  bh_env_id: number;
  tenant_key: string;
  compute_config_id: number;
  bh_env_name: string;
  compute_config: {
    emr_version: string;
    custom_image_uri: string;
    instance_type: string;
    worker_count: number;
    idle_timeout_seconds: number;
    aws_logs_uri: string;
    ec2_subnet_id: string;
    emr_master_security_group: string;
    emr_slave_security_group: string;
    service_access_security_group: string;
    job_flow_role: string;
    service_role: string;
    ec2_key_name: string;
    applications: string[];
    aws_cloud_connection: string;
    region: string;
    bh_tags: string[];
  };
}

interface ComputeClusterListApiResponse {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: ComputeClusterApiResponse[];
  
}

export interface Environment {
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  is_deleted: string | null;
  deleted_by: string | null;
  bh_env_id: number;
  bh_env_name: string;
  bh_env_provider: number;
  cloud_provider_cd: number;
  cloud_region_cd: number;
  location: string | null;
  pvt_key: string | null;
  status: string;
  tags: Record<string, any>;
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

export function useComputeCluster() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch allowed compute types
  const useComputeTypes = (cloudProvider: string = 'AWS') => {
    return useQuery<ComputeTypesResponse>({
      queryKey: ['compute-types', cloudProvider],
      queryFn: async () => {
        console.log(`Fetching compute types for cloud provider: ${cloudProvider}`);
        const response = await apiService.get<ComputeTypesResponse>({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: '/bh_compute/allowed-compute-types',
          usePrefix: true,
          params: { cloud_provider: cloudProvider },
          method: 'GET'
        });
        console.log('Compute types response:', response);
        return response;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2
    });
  };

  // Transform API response to match ComputeCluster interface
  const transformApiResponseToComputeCluster = (apiData: ComputeClusterApiResponse[]) => {
    return apiData.map(item => ({
      id: item.compute_config_id.toString(),
      name: item.compute_config_name,
      environment: item.bh_env_name,
      platform: item.compute_type,
      region: item.compute_config.region,
      instanceType: item.compute_config.instance_type,
      minNodes: 1, // API doesn't provide this, using default
      maxNodes: item.compute_config.worker_count + 1, // Approximate based on worker count
      currentNodes: item.compute_config.worker_count,
      status: 'active' as const, // API doesn't provide status, using default
      createdAt: new Date().toISOString(), // API doesn't provide this, using current time
      updatedAt: new Date().toISOString(), // API doesn't provide this, using current time
      createdBy: item.tenant_key, // Using tenant key as created by
      tags: item.compute_config.bh_tags.map(tag => ({
        key: 'tag',
        value: tag
      }))
    }));
  };

  // Fetch compute cluster list
  const useComputeClusterList = (options: { limit?: number; offset?: number; } = {}) => {
    const { limit = 10, offset = 0 } = options;
    return useQuery({
      queryKey: ['compute-cluster-list', limit, offset],
      queryFn: async () => {
        console.log('Fetching compute cluster list');
        const response = await apiService.get<ComputeClusterListApiResponse>({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: '/bh_compute/bh-compute-config/list/',
          usePrefix: true,
          params: { 
            offset,
            limit,
            order_by: 'created_at', 
            order_desc: true 
          },
          method: 'GET'
        });
        console.log('Compute cluster list response:', response);
        // Extract the data array from the response object
        return transformApiResponseToComputeCluster(response.data);
      },
      staleTime: 30 * 1000, // 30 seconds
      retry: 2
    });
  };

  // Fetch individual compute cluster details
  const useComputeClusterDetail = (id: string) => {
    return useQuery({
      queryKey: ['compute-cluster-detail', id],
      queryFn: async () => {
        console.log('Fetching compute cluster detail for id:', id);
        const response = await apiService.get<ComputeClusterApiResponse>({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: `/bh_compute/bh-compute-config/${id}`,
          usePrefix: true,
          method: 'GET'
        });
        console.log('Compute cluster detail response:', response);
        
        // Transform the single item response to form values format
        return {
          compute_config_name: response.compute_config_name,
          compute_type: response.compute_type,
          bh_env_id: response.bh_env_id.toString(), // Convert to string for form
          tenant_key: response.tenant_key,
          compute_config: response.compute_config
        };
      },
      enabled: !!id, // Only fetch when id is available
      staleTime: 30 * 1000, // 30 seconds
      retry: 2
    });
  };

  // Fetch compute config schema based on compute type
  const useComputeConfigSchema = (computeType: string) => {
    return useQuery<ComputeConfigSchemaResponse>({
      queryKey: ['compute-config-schema', computeType],
      queryFn: async () => {
        console.log(`Fetching compute config schema for type: ${computeType}`);
        const response = await apiService.get<ComputeConfigSchemaResponse>({
          baseUrl: CATALOG_REMOTE_API_URL,
          usePrefix: true,
          url: `/bh_compute/compute-config/schema/${computeType}`,
          method: 'GET'
        });
        console.log('Compute config schema response:', response);
        return response;
      },
      enabled: !!computeType, // Only fetch when computeType is available
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2
    });
  };

  const handleCreateComputeCluster = async (data: ComputeClusterFormValues) => {
    setIsLoading(true);
    try {
      console.log('Creating compute cluster with data:', JSON.stringify(data, null, 2));
      
      // Prepare the payload according to the API specification
      const payload = {
        compute_config_name: data.compute_config_name,
        compute_type: data.compute_type,
        bh_env_id: typeof data.bh_env_id === 'string' ? parseInt(data.bh_env_id) : data.bh_env_id,
        tenant_key: data.tenant_key,
        compute_config: {
          ...data.compute_config,
          // worker_count is already a number after schema transformation
          worker_count: data.compute_config?.worker_count || 1,
          idle_timeout_seconds: data.compute_config?.idle_timeout_seconds || 300,
          // Ensure arrays exist
          applications: data.compute_config?.applications || ['Spark'],
          bh_tags: data.compute_config?.bh_tags || []
        }
      };

      console.log('API Payload:', JSON.stringify(payload, null, 2));
      
      // Make the actual API call to create compute cluster
      const response = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_compute/bh-compute-config',
        usePrefix: true,
        data: payload,
        method: 'POST'
      });
      
      console.log('Create compute cluster response:', response);
      toast.success('Compute cluster created successfully!');
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to create compute cluster:', error);
      
      // Extract error message from API response if available
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || error?.message 
        || 'Failed to create compute cluster. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComputeCluster = async (id: string, data: ComputeClusterFormValues) => {
    setIsLoading(true);
    try {
      console.log('Updating compute cluster with data:', JSON.stringify({ id, data }, null, 2));
      
      // Prepare the payload according to the API specification - only compute_config is needed for update
      const payload = {
        compute_config: {
          ...data.compute_config,
          // worker_count is already a number after schema transformation
          worker_count: data.compute_config?.worker_count || 1,
          idle_timeout_seconds: data.compute_config?.idle_timeout_seconds || 300,
          // Ensure arrays exist
          applications: data.compute_config?.applications || ['Spark'],
          bh_tags: data.compute_config?.bh_tags || []
        }
      };

      console.log('API Update Payload:', JSON.stringify(payload, null, 2));
      
      // Make the actual API call to update compute cluster
      const response = await apiService.put({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/bh_compute/bh-compute-config/${id}`,
        usePrefix: true,
        data: payload,
        method: 'PUT'
      });
      
      console.log('Update compute cluster response:', response);
      toast.success('Compute cluster updated successfully!');
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Failed to update compute cluster:', error);
      
      // Extract error message from API response if available
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || error?.message 
        || 'Failed to update compute cluster. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestComputeCluster = async (data: ComputeClusterFormValues) => {
    try {
      console.log('Testing compute cluster configuration:', JSON.stringify(data, null, 2));
      
      // Prepare the payload according to the API specification
      const payload = {
        compute_config_name: data.compute_config_name,
        compute_type: data.compute_type,
        bh_env_id: typeof data.bh_env_id === 'string' ? parseInt(data.bh_env_id) : data.bh_env_id,
        tenant_key: data.tenant_key,
        compute_config: {
          ...data.compute_config,
          // worker_count is already a number after schema transformation
          worker_count: data.compute_config?.worker_count || 1,
          idle_timeout_seconds: data.compute_config?.idle_timeout_seconds || 300,
          // Ensure arrays exist
          applications: data.compute_config?.applications || ['Spark'],
          bh_tags: data.compute_config?.bh_tags || []
        }
      };

      console.log('API Test Payload:', JSON.stringify(payload, null, 2));
      
      // Make the actual API call to test compute cluster configuration
      // Assuming there's a test endpoint, adjust URL as needed
      const response:any = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_compute/bh-compute-config/test',
        usePrefix: true,
        data: payload,
        method: 'POST'
      });
      
      console.log('Test compute cluster response:', response);
      toast.success('Compute cluster configuration test successful!');
      return { 
        success: true, 
        message: response?.message || 'Configuration validated successfully. All settings are correct.' 
      };
    } catch (error: any) {
      console.error('Failed to test compute cluster:', error);
      
      // Extract error message from API response if available
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || error?.message 
        || 'Configuration validation failed. Please check your settings.';
      
      toast.error('Compute cluster configuration test failed');
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };
  const useEnvironmentsList= () => {
    return useQuery<Environment[]>({
      queryKey: ['environments', 'list'],
      queryFn: async () => {
        console.log('Fetching environments list');
        const response:any = await apiService.get<Environment[]>({
          baseUrl: CATALOG_REMOTE_API_URL,
          url: '/environment/environment/list/',
          usePrefix: true,
          method: 'GET',
          params: { limit: 1000 }
        });
        console.log('Environments list response:', response);
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2
    });
  };

  const handleDeleteComputeCluster = async (id: string) => {
    setIsLoading(true);
    try {
      console.log('Deleting compute cluster with id:', id);
      
      // Make the actual API call to delete compute cluster
      await apiService.delete({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/bh_compute/bh-compute-config/${id}`,
        usePrefix: true,
        method: 'DELETE'
      });
      
      console.log('Delete compute cluster successful');
      toast.success('Compute cluster deleted successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete compute cluster:', error);
      
      // Extract error message from API response if available
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || error?.message 
        || 'Failed to delete compute cluster. Please try again.';
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreateComputeCluster,
    handleUpdateComputeCluster,
    handleDeleteComputeCluster,
    handleTestComputeCluster,
    useComputeTypes,
    useComputeConfigSchema,
    useComputeClusterList,
    useComputeClusterDetail,
    useEnvironmentsList,
    isLoading
  };
}