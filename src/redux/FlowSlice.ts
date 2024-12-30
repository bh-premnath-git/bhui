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
  dagParserTime: string | null;
  dagEunID: any | null
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
  selectedEnvironment: null,
  dagParserTime: null,
  dagEunID: null
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

interface UpdateFlowDefinitionParams {
  flow_id: string;
  flow_json: Record<string, any>;
}

interface UpdateFlowConfigParams {
  flow_config_id: string | number;
  flow_config: Record<string, any>;
}

interface ListParams {
  offset: number;
  limit: number;
}

export const createFlow = createAsyncThunk<
  any, // Return type
  CreateFlowParams | any, // Thunk argument type
  { rejectValue: string } // Additional ThunkAPI options
>(
  "flow/create",
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await ApiService(
        "8011",
        "post",
        "/flow/create/",
        params,
        null,
        {},
        true,
        signal
      );
      return response;
    } catch (error: any) {
      // Check if the error is due to a canceled request
      if (error.name === "AbortError") {
        console.log("createFlow request was canceled");
        return rejectWithValue("Request canceled");
      }

      // Handle other errors
      const flowError = error.message?.includes("deployment failed")
        ? undefined
        : error.message;
      return rejectWithValue(flowError || "An unknown error occurred");
    }
  }
);


export const listFlows = createAsyncThunk<
  any[],
  ListParams,
  { rejectValue: string }
>(
  "flow/list",
  async (params, { rejectWithValue, signal }) => {
    try {
      const response = await ApiService(
        "8011",
        "get",
        "/flow/list/",
        null,
        params,
        {},
        true,
        signal
      );
      const transformed = response.map((item: any) => ({
        id: item.flow_id,
        Name: item.flow_name,
        ...item,
        CreatedBy: decoded?.name ?? "",
      }));
      return transformed;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("createFlow request was canceled");
        return rejectWithValue("Request canceled");
      }
      return rejectWithValue(error.message);
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
  async (params = {}, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/bh_project/list/', null, params);

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
      const response = await ApiService('8011', 'get', '/environment/environment/list/', null, { offset: 0, limit: 100 });
      const transformed = response.map((item: any) => (
        {
          id: item["bh_env_id"],
          envName: item["bh_env_name"],
          airflowEnvName: item["airflow_env_name"],
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

export const patchFlowOperation = createAsyncThunk<
  any,
  { flow_id: string; data: Record<string, any> },
  { rejectValue: string }
>(
  'flow/patchFlowOperation',
  async ({ flow_id, data }, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'patch', `/flow/${flow_id}`, data);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

///api/v1/flow/{flow_id}
export const deleteFlowbyId = createAsyncThunk<
  any,
  { flow_id: string | number },
  { rejectValue: string }
>(
  "flow/deleteFlow",
  async ({ flow_id }, thunkAPI) => {
    try {
      const response = await ApiService("8011", "delete", `/flow/${flow_id}`);
      return { flow_id, response };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateFlowDefinition = createAsyncThunk<
  any,
  UpdateFlowDefinitionParams,
  { rejectValue: string }
>(
  'flow/updateFlowDefinition',
  async ({ flow_id, flow_json }, { rejectWithValue, signal }) => {  
    
    try {
      const response = await ApiService(
        '8011',
        'patch',
        `/flow/flow-definition/update-by-flow-id/${flow_id}`,
        flow_json,
        null,
        {},
        true,
        signal
      );
      return response;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("updateFlowDefinition request was canceled");
        return rejectWithValue("Request canceled");
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateFlowConfiguration = createAsyncThunk<
  any,
  UpdateFlowConfigParams,
  { rejectValue: string }
>(
  'flow/updateFlowConfiguration',
  async ({ flow_config_id, flow_config }, thunkAPI) => {
    try {
      const response = await ApiService(
        '8011',
        'put',
        `/flow/flow-config/${flow_config_id}`,
        { flow_config: flow_config }
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// /api/v1/flow/flow-deployement/{flow_deployment_id} cron_expression
export const patchCronDeployment = createAsyncThunk<
  any,
  { flow_deployment_id: string | number; cron_expression: any },
  { rejectValue: string }
>(
  'flow/patchCronDeployment',
  async ({ flow_deployment_id, cron_expression }, thunkAPI) => {
    try {
      const response = await ApiService(
        '8011',
        'patch',
        `/flow/flow-deployment/${flow_deployment_id}`,
        { cron_expression: cron_expression }
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const dagParserTimeFunc = createAsyncThunk<
  string,
  any,
  {
    rejectValue: string;
  }
>(
  'flow/dagParserTime',
  async (params, thunkAPI) => {
    try {
      const response: string = await ApiService('8011', 'get', 'bh_airflow/dag_parse_time', null, params);
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
    setDagRunId: (state, action: PayloadAction<any | null>) => {
      state.dagEunID = action.payload;
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
      //delete
      .addCase(deleteFlowbyId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFlowbyId.fulfilled, (state, action) => {
        state.loading = false;
        const { flow_id } = action.payload;
        // Remove the deleted flow from the state
        state.flows = state.flows.filter((flow) => flow.id !== flow_id);
      })
      .addCase(deleteFlowbyId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred while deleting the flow";
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
      })
      .addCase(patchFlowOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchFlowOperation.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFlow = action.payload;
      })
      .addCase(patchFlowOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while patching the flow';
      })
      .addCase(updateFlowDefinition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlowDefinition.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFlow = action.payload;
        //console.log("updatedFlow def", updatedFlow);

      })
      .addCase(updateFlowDefinition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while updating flow definition';
      })
      // update flow config
      .addCase(updateFlowConfiguration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlowConfiguration.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to update the state with the updated configuration
        // depending on your requirements
        const updatedConfig = action.payload;
        //console.log("updatedFlowConfig", updatedConfig);
      })
      .addCase(updateFlowConfiguration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while updating flow configuration';
      })
      .addCase(patchCronDeployment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchCronDeployment.fulfilled, (state, action) => {
        state.loading = false;
        // You might want to update relevant state here depending on the response
        const updatedDeployment = action.payload;
        //console.log("updatedDeployment", updatedDeployment);
      })
      .addCase(patchCronDeployment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while updating deployment schedule';
      })
      .addCase(dagParserTimeFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dagParserTimeFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.dagParserTime = action.payload;
      })
      .addCase(dagParserTimeFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred while fetching DAG parser time';
      });
  },
});



export const { setSelectedFlowFromList, setSelectedEnv, setDagRunId, clearSearchResults } = flowSlice.actions;
export default flowSlice.reducer;