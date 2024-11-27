import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiService } from "@/services/apiServices";
import { jwtDecode } from "jwt-decode";

const token: any = sessionStorage?.getItem("token");
const decoded: any = token ? jwtDecode(token) : null;

export interface FlowProject {
  [key: string]: any;
}

export interface FlowState {
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  flowData: any | null;
  searchedFlow: any | null;
  flows: any[];
  flowProjectList: FlowProject[];
  environments: any[];
  selectedFlowFromList: any | null;
  selectedEnvironment: any | null;
}

const initialState: FlowState = {
  loading: false,
  searchLoading: false,
  error: null,
  flowData: null,
  searchedFlow: null,
  flows: [],
  flowProjectList: [],
  environments: [],
  selectedFlowFromList: null,
  selectedEnvironment: null
};

interface CreateFlowParams {
  flow_name: string;
  git_branch: string;
  bh_project_id: number;
  json_config: Record<string, any>;
  bh_env_provider: number;
  bh_env_id: number;
  flow_class: number;
  recipient_email: Record<string, string[]>;
  notes: string;
  job: string;
  last_executed: string;
  tags: Record<string, any>;
  schedule_interval: {
    schedule_type: string;
    time: Record<string, any>;
  };
}

interface DeploymentParams {
  flow_id: number,
  bh_env_id: number,
  cron_expression: any
}

export const createFlow = createAsyncThunk<
  any, // Return type
  CreateFlowParams | any, // Thunk argument type
  {
    rejectValue: string; // Type of the value passed to rejectWithValue
  }
>(
  'flow/create',
  async (params, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'post', '/flow/create/', params);
      return response;
    } catch (error: any) {
      const isDeploymentError = error.message?.includes('deployment failed');
      const flowError = isDeploymentError ? undefined : error.message;
      return thunkAPI.rejectWithValue(flowError);
    }
  }
);

export const listFlows = createAsyncThunk<
  any[], // Return type
  void,
  {
    rejectValue: string;
  }
>(
  'flow/list',
  async (_, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/flow/list/');
      const transformed: any[] = response.map((item: any) => {
        return ({
          id: item["flow_id"],
          Name: item["flow_name"],
          ...item,
          CreatedBy: decoded?.name ?? ""
        })
      })
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getFlowProjectList = createAsyncThunk<
  FlowProject[],
  any,
  {
    rejectValue: string;
  }
>(
  'flow/gitproject',
  async (params, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/bh_project/list/', null, params = {});

      const transformed: FlowProject[] = response.map((item: any) => {
        return ({
          Name: item["bh_project_name"],
          ProjectId: item["bh_project_id"],
          BranchNames: [item["bh_default_branch"], "other"]
        })
      });
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getEnvironmentList = createAsyncThunk<
  any[],
  void,
  {
    rejectValue: string;
  }
>(
  'flow/environmentList',
  async (_, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/environment/environment/list/');
      const transformed = response.map((item: any) => (
        {
          id: item["bh_env_id"],
          envName: item["bh_env_name"],
        }

      ))
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const searchFlow: any = createAsyncThunk(
  'flows/searchFlow',
  async (value: string, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', `/flow/flow/search?flow_name=${value}`);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const flowSlice = createSlice({
  name: "api/flow",
  initialState,
  reducers: {
    setSelectedFlowFromList: (state, action: PayloadAction<any | null>) => {
      state.selectedFlowFromList = action.payload;
    },
    setSelectedEnv: (state, action: PayloadAction<any | null>) => {
      state.selectedEnvironment = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchedFlow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createFlow
      .addCase(createFlow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFlow.fulfilled, (state, action) => {
        state.loading = false;
        state.flowData = action.payload;
      })
      .addCase(createFlow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Network error occurred';
      })
      // listFlows
      .addCase(listFlows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listFlows.fulfilled, (state, action) => {
        state.loading = false;
        state.flows = action.payload;
        state.selectedFlowFromList = null;
      })
      .addCase(listFlows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // getFlowProjectList
      .addCase(getFlowProjectList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlowProjectList.fulfilled, (state, action) => {
        state.loading = false;
        state.flowProjectList = action.payload;
      })
      .addCase(getFlowProjectList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      })
      // searchFlow
      .addCase(searchFlow.pending, (state) => {
        state.searchLoading = true; 
        state.error = null;
      })
      .addCase(
        searchFlow.fulfilled,
        (state, action) => {
          state.searchLoading = false;
          state.searchedFlow = action.payload;
        }
      )
      .addCase(
        searchFlow.rejected,
        (state, action: PayloadAction<string>) => {
          state.searchLoading = false;
          state.error = action.payload;
        }
      )
      // getEnvironmentList
      .addCase(getEnvironmentList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnvironmentList.fulfilled, (state, action) => {
        state.loading = false;
        state.environments = action.payload;
      })
      .addCase(getEnvironmentList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred';
      });
  },
});



export const { setSelectedFlowFromList, setSelectedEnv, clearSearchResults } = flowSlice.actions;
export default flowSlice.reducer;
