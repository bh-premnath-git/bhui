import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DataSource } from '@/types/data-catalog/dataCatalog';
import { Connection } from '@/types/admin/connection';
import { Project } from '@/types/admin/project';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';
interface DataSourceState {
  datasource: DataSource[];
  selectedDataSource: DataSource | null;
  loading: boolean;
  error: string | null;
  connections: Connection[];
  project: Project[];
  selectedProject: Project | null;
  selectedConnection: Connection | null;
  connectionConfigList: any;

}

const initialState: DataSourceState = {
  datasource: [],
  selectedDataSource: null,
  project: [],
  selectedProject: null,
  connections: [],
  selectedConnection: null,
  loading: false,
  error: null,
  connectionConfigList: [],

};

export const fetchProjects = createAsyncThunk(
  "connection/fetchProjects",
  async () => {
    const response = await apiService.get<{data:Project[]}>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/bh_project/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch projects'
      },
      params: { limit: 1000 }
    });
    return response.data;
  }
);

export const fetchConnections = createAsyncThunk(
  "connection/fetchConnections",
  async () => {
    const response = await apiService.get<{data:Connection[]}>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/connection_registry/connection_config/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch connections'
      },
      params: { limit: 1000 }
    });
    return response.data;
  }
);


export const getConnectionConfigList = createAsyncThunk(
  "catalog/connection",
  async (params: any) => {
    const response:any = await apiService.get<any[]>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/connection_registry/connection_config/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch connection config list'
      },
      params: params
    });
    return response.data;
  }
);

const dataSourceSlice = createSlice({
  name: 'datasource',
  initialState,
  reducers: {
    setDatasources: (state, action: PayloadAction<DataSource[]>) => {
      state.datasource = action.payload;
    },
    setSelectedDatasource: (state, action: PayloadAction<DataSource | null>) => {
      state.selectedDataSource = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<number>) => {
      state.selectedProject = state.project.find(p => p.bh_project_id === action.payload) || null;
    },
    setSelectedConnection: (state, action: PayloadAction<number>) => {
      state.selectedConnection = state.connections.find(c => c.id === action.payload) || null;
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
        state.project = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(getConnectionConfigList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConnectionConfigList.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.connectionConfigList = action.payload;
      })
      .addCase(getConnectionConfigList.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setDatasources, setSelectedDatasource, setSelectedConnection, setSelectedProject, setLoading, setError } = dataSourceSlice.actions;
export default dataSourceSlice.reducer;