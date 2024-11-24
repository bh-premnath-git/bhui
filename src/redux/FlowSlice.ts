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
  bh_env_id: number;
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

interface DeploymentParams {
  flow_id: number,
  bh_env_id: number,
  cron_expression: any
}

// Create deployment thunk
const createDeployment = createAsyncThunk<
  any,
  DeploymentParams,
  {
    rejectValue: string;
  }
>(
  'flow/deployment/create',
  async (params, thunkAPI) => {
    try {
      const response = await ApiService(
        '8011',
        'post',
        '/flow/flow-deployement/create',
        params
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const shouldCreateDeployment = (flowParams: any): boolean => {
  return (
    flowParams.flow_id > 0 &&
    flowParams.bh_env_id > 0
  );
};

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
      const deploymentParams = { flow_id: response.flow_id, bh_env_id: params.bh_env_id, cron_expression: params.schedule_interval }
      if (shouldCreateDeployment(deploymentParams)) {
        const deploymentResult = await thunkAPI.dispatch(createDeployment(deploymentParams));
        
        if (createDeployment.rejected.match(deploymentResult)) {
          throw new Error(`Flow created but deployment failed: ${deploymentResult.payload}`);
        }
      }

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
      // createdeployment
      .addCase(createDeployment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeployment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createDeployment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Deployment failed';
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
