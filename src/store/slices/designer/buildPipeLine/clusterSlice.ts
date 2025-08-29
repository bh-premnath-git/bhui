import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

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

interface ClusterState {
  clusters: Cluster[];
  selectedCluster: Cluster | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClusterState = {
  clusters: [],
  selectedCluster: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchClusters = createAsyncThunk(
  'clusters/fetchClusters',
  async (params: { bh_env_id: string, region: string }) => {
    const response = await apiService.get<{ clusters: Cluster[] }>({
      baseUrl:CATALOG_REMOTE_API_URL,
      url: '/bh_compute/list-clusters',
      params,
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch clusters'
      }
    });
    return response.clusters;
  }
);

export const createCluster = createAsyncThunk(
  'clusters/createCluster',
  async (data: { cluster_name: string, bh_env_id: string, region: string }) => {
    const response = await apiService.post<Cluster>({
      baseUrl:CATALOG_REMOTE_API_URL,
      url: '/bh_cluster/create-cluster',
      data,
      usePrefix: true,
      method: 'POST',
      metadata: {
        errorMessage: 'Failed to create cluster'
      }
    });
    return response;
  }
);

export const terminateCluster = createAsyncThunk(
  'clusters/terminateCluster',
  async (data: { clusterId: string, bh_env_id: string, region: string }) => {
    await apiService.post({
      baseUrl:CATALOG_REMOTE_API_URL,
      url: `/bh_compute/terminate-cluster/${data.clusterId}`,
      params: { bh_env_id: data.bh_env_id, region: data.region },
      usePrefix: true,
      method: 'POST',
      metadata: {
        errorMessage: 'Failed to terminate cluster'
      }
    });
    return data.clusterId;
  }
);

const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setSelectedCluster: (state, action: PayloadAction<Cluster | null>) => {
      state.selectedCluster = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clusters
      .addCase(fetchClusters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClusters.fulfilled, (state, action) => {
        state.loading = false;
        state.clusters = action.payload;
      })
      .addCase(fetchClusters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clusters';
      })
      
      // Create Cluster
      .addCase(createCluster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCluster.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add the new cluster to the list if the API returns the created cluster
        if (action.payload) {
          state.clusters.push(action.payload);
        }
      })
      .addCase(createCluster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create cluster';
      })
      
      // Terminate Cluster
      .addCase(terminateCluster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(terminateCluster.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the terminated cluster from the list
        state.clusters = state.clusters.filter(cluster => cluster.Id !== action.payload);
        if (state.selectedCluster?.Id === action.payload) {
          state.selectedCluster = null;
        }
      })
      .addCase(terminateCluster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to terminate cluster';
      });
  },
});

export const { setSelectedCluster, clearError } = clusterSlice.actions;
export default clusterSlice.reducer; 