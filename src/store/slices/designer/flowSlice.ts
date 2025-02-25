import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flow } from '@/types/designer/flow';
import { Environment } from '@/types/admin/environment';
import { Project } from '@/types/admin/project';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

interface FlowState {
    flows: Flow[];
    selectedFlow: Flow | null;
    environment: Environment | null;
    dagEunID: Record<string, any> | null
    projects: Project[];
    environments: Environment[];
    loading: boolean;
    error: string | null;
}

const initialState: FlowState = {
    flows: [],
    selectedFlow: null,
    environment: null,
    dagEunID: null,
    projects: [],
    environments: [],
    loading: false,
    error: null,
};

export const fetchProjects = createAsyncThunk(
    "flows/fetchProjects",
    async () => {
      const response = await apiService.get<Project[]>({
        portNumber: CATALOG_API_PORT,
        url: '/bh_project/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch projects'
        }
      });
      return response;
    }
);

export const fetchEnvironments = createAsyncThunk(
    "flows/fetchEnvironments",
    async () => {
      const response = await apiService.get<Environment[]>({
        portNumber: CATALOG_API_PORT,
        url: '/environment/environment/list/',
        usePrefix: true,
        method: 'GET',
        metadata: {
          errorMessage: 'Failed to fetch environments'
        }
      });
      return response;
    }
);

const flowSlice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlows: (state, action: PayloadAction<Flow[]>) => {
            state.flows = action.payload;
        },
        setSelectedFlow: (state, action: PayloadAction<Flow | null>) => {
            state.selectedFlow = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch projects';
            })
            .addCase(fetchEnvironments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnvironments.fulfilled, (state, action) => {
                state.loading = false;
                state.environments = action.payload;
            })
            .addCase(fetchEnvironments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch environments';
            });
    },
});

export const { setFlows, setSelectedFlow, setLoading, setError } = flowSlice.actions;
export default flowSlice.reducer;