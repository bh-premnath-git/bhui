import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiService } from "@/services/api.services";
import { AUDIT_PORT } from "@/services/environment";

export interface ApiState {
  getDataOpsList: any;
  filterData: any;
  loading: boolean;
  error: string | null;
  taskDetails: any[];
  taskLoading: boolean;
  taskError: string | null;
}

const initialState: ApiState = {
  loading: false,
  error: null,
  getDataOpsList: [],
  filterData: [],
  taskDetails: [],
  taskLoading: false,
  taskError: null,
};

interface ApiResponse {
  bh_project_id: number;
  name: string;
}

export const getDataOps: any = createAsyncThunk(
  'dataops_hub/dataops',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService({
        portNumber: AUDIT_PORT,
        method: 'get',
        url: '/job_details/list/',
        params: params,
        data: null
      });
      const transformed = response.map((item: any, index: number) => ({
        ...item,
        id: (index).toString(),
        flow: item.flow_name,
        project: item.project_name,
        status: item.flow_status,
        startTime: item.job_start_time,
        duration: (new Date(item.job_end_time)).getTime() - (new Date(item.job_start_time)).getTime(),
        owner: item.updated_by
      }))
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getTaskDetails = createAsyncThunk<
  any[],
  string | number,
  { rejectValue: string }
>(
  "dataops_hub/taskDetails",
  async (jobId, thunkAPI) => {
    try {
      const params = {
        job_id: jobId,
        offset: 0,
        limit: 100,
        order_desc: false,
      };
      const response = await ApiService({
        portNumber: AUDIT_PORT,
        method: 'get',
        url: '/task_details/list/',
        params: params,
        data: null
      });
      const transformed = response.map((item: any, index: number) => ({
        ...item,
        id: index.toString(),
      }));
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message as string);
    }
  }
);

const DataOpsSlice = createSlice({
  name: "api/dataops",
  initialState,
  reducers: {
    setFilterData: (state, action) => {

      if (action.payload?.dataOpsList && action.payload?.value) {
        const filteredData = action.payload.dataOpsList.filter((item: any) =>
          item.pipeline_name.toLowerCase().includes(action.payload.value.toLowerCase())
        )
        state.getDataOpsList = filteredData;
      } else {
        console.warn('Invalid payload structure:', action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDataOps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDataOps.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.getDataOpsList = action.payload;
        }
      )
      .addCase(
        getDataOps.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(getTaskDetails.pending, (state) => {
        state.taskLoading = true;
        state.taskError = null;
      })
      .addCase(
        getTaskDetails.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.taskLoading = false;
          state.taskDetails = action.payload; // store the tasks
        }
      )
      .addCase(getTaskDetails.rejected, (state, action: PayloadAction<string>) => {
        state.taskLoading = false;
        state.taskError = action.payload;
      });

  },
});

export default DataOpsSlice.reducer;
export const { setFilterData } = DataOpsSlice.actions;