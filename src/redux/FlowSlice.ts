import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {ApiService} from "@/services/apiServices";

export interface FlowProject {
  [key: string]: any;
}

export interface FlowState {
  loading: boolean;
  error: string | null;
  flowData: any | null;
  flows: any[];
  flowProjectList: FlowProject[];
  environments: any[];
  selectedFlowFromList: any | null;
}

const initialState: FlowState = {
  loading: false,
  error: null,
  flowData: null,
  flows: [],
  flowProjectList: [],
  environments: [],
  selectedFlowFromList: null,
};

interface CreateFlowParams {
  flow_name: string;
  git_branch: string;
  bh_project_id: number;
  json_config: Record<string, any>;
  bh_env_provider: number;
  flow_class: number;
  recipent_emails: string;
  notes: string;
  job: string;
  last_executed: string;
  tags: Record<string, any>;
  schedule_interval: {
    schedule_type: string;
    time: Record<string, any>;
  };
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
      return thunkAPI.rejectWithValue(error.message);
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
          Schedule: "",
          Environment: item["bh_env_provider"],
          Project: item["bh_project_id"],
          CreatedBy: item["created_by"] ?? "NA",
          LastUpdatedOn: item["last_updated"],
          LastExecutedOn: item["last_executed"],
          ...item
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
      const response = await ApiService('8011', 'get', '/env/environment/list/');
      const transformed = response.map((item: any) => (
        {
          id: item["bh_env_provider"],
          envName: item["bh_env_name"],
        }

      ))
      return transformed;
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
        state.error = action.payload || 'An error occurred';
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



export const { setSelectedFlowFromList } = flowSlice.actions;
export default flowSlice.reducer;
