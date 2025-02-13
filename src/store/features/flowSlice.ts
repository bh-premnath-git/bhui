import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Flow } from '@/types/features/flow/types';
import { Environment } from '@/types/features/environment/types';
import { Project } from '@/types/features/project/types';
import { ApiService } from '@/services/api.services';
import { CATALOG_API_PORT } from '@/services/environment';

interface FlowState {
    flows: Flow[];
    flow: Flow | null;
    environments: Environment[];
    environment: Environment | null;
    projects: Project[];
    project: Project | null;
    searchedFlow: Flow | null;
    searchLoading: boolean;
    loading: boolean;
    error: string | null;
    dagParserTime: string | null;
    dagEunID: string | null
}

const initialState: FlowState = {
    flows: [],
    flow: null,
    environments: [],
    environment: null,
    projects: [],
    project: null,
    searchedFlow: null,
    searchLoading: false,
    loading: false,
    error: null,
    dagParserTime: null,
    dagEunID: null
};

export const getFlowProjectList = createAsyncThunk<
  [Project[], Environment[]],
  any,
  {
    rejectValue: string;
  }
>(
  'flow/gitproject',
  async (params = {}, thunkAPI) => {
    try {
      const [responseProj, responseEnv] = await Promise.all([
        ApiService({
          portNumber: CATALOG_API_PORT,
          method: 'get',
          url: '/bh_project/list/',
          params,
        }),
        ApiService({
          portNumber: CATALOG_API_PORT,
          method: 'get',
          url: '/environment/environment/list/',
          params: { offset: 0, limit: 100 },
        }),
      ]);

      return [responseProj, responseEnv];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const flowSlice = createSlice({
    name: 'flows',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        setFlows(state, action: PayloadAction<Flow[]>) {
            state.flows = action.payload;
            state.loading = false;
            state.error = null;
        },
        setFlow(state, action: PayloadAction<Flow>){
            state.flow = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearDataSources(state) {
            state.flows = [];
            state.flow = null;
            state.loading = false;
            state.error = null;
          },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getFlowProjectList.fulfilled, (state, action) => {
            
            state.projects = action.payload[0] || [];
            state.environments = action.payload[1] || [];
        })
        .addCase(getFlowProjectList.rejected, (state, action) => {
            state.error = action.payload as string;

        })
        .addCase(getFlowProjectList.pending, (state, action) => {
            state.loading = true;
        });
    },
}   );

export const { setLoading, setError, setFlows, setFlow } = flowSlice.actions;
export default flowSlice.reducer;
