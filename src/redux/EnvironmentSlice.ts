import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {ApiService} from "@/services/apiServices";
import { update } from "lodash";

export interface Environment {
  id: string;
  name: string;
  Environment_Id?: number | string;
  // Add other environment properties here
}

export interface EnvironmentState {
  environmentList: Environment[];
  loading: boolean;
  error: string | null;
  selectedEnvironment?: Environment | null;
  editEnvironmentData: any;
}

const initialState: EnvironmentState = {
  environmentList: [],
  loading: false,
  error: null,
  selectedEnvironment: null,
  editEnvironmentData:{}
};

interface CreateEnvironmentData {
  bh_env_name: string;
  bh_env_provider: number;
  cloud_provider_cd: number;
  cloud_region_cd: number;
  status_cd: string;
  project_id: string;
  location?: string;
  tags?: string;
  file?: File | null;
  secret_access_key?: string;
  airflow_url?: string;
  airflow_bucket_name?: string;
  airflow_env_name?: string;
  access_key?: string;
}

const formatDate = (date: Date | undefined | null): string | null => {
  if (!date) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const createEnvironment = createAsyncThunk<Environment, CreateEnvironmentData, { rejectValue: string }>(
  'environment/create',
  async (environmentData, thunkAPI) => {
    try {
      let data: any;
      let headers = {};
      const filteredData = Object.fromEntries(
        Object.entries(environmentData).filter(([_, value]) => value != null && value !== "")
      );
        data = new FormData();
        Object.entries(filteredData).forEach(([key, value]) => {
          if (value !== undefined) {
            data.append(key, value);
          }
        });
      
      const response = await ApiService('8011', 'post', '/environment/environment', data, null, headers);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const listEnvironments = createAsyncThunk<Environment[], void, { rejectValue: string }>(
  'environment/list',
  async (_, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/environment/environment/list/', null, null);
      const transformed = response.map((item: any) => {
        return ({
          Environment_Id: item["bh_env_id"],
          Environment_Name: item["bh_env_name"],
          Cloud_Provider: item["cloud_provider_name"],
          Created_On: formatDate(item["Created_On"]) ?? formatDate(new Date()),
          ...item,
          Environment: item["bh_env_provider_name"],
        })
      })
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchEnvironmentData = createAsyncThunk<Environment, string | number, { rejectValue: string }>(
  'environment/fetchById',
  async (id, thunkAPI) => {
    try {
      const data = await ApiService('8011', 'get', `/environment/environment/${id}`);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editEnvironment = createAsyncThunk<Environment, any, { rejectValue: string }>(
  'environment/edit',
  async (environmentData, thunkAPI) => {
    try {
      const { id, ...updateData } = environmentData;
      const response = await ApiService('8011', 'put', `/environment/environment/${id}`, updateData);
      
      return {
        Environment_Id: response.bh_env_id,
        Environment_Name: response.bh_env_name,
        Cloud_Provider: response.cloud_provider_name,
        projectId: response.project_id,
        Created_On: formatDate(response.Created_On) ?? formatDate(new Date()),
        ...response,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
const environmentSlice = createSlice({
  name: "api/environment",
  initialState,
  reducers: {
    setEditEnvironmentData: (state, action) => {
      state.editEnvironmentData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnvironment.fulfilled, (state, action: PayloadAction<Environment>) => {
        state.loading = false;
        state.environmentList.push(action.payload);
      })
      .addCase(createEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      })
      .addCase(listEnvironments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listEnvironments.fulfilled, (state, action: PayloadAction<Environment[]>) => {
        state.loading = false;
        state.environmentList = action.payload;
      })
      .addCase(listEnvironments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      })
      .addCase(fetchEnvironmentData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvironmentData.fulfilled, (state, action: PayloadAction<Environment>) => {
        state.loading = false;
        state.selectedEnvironment = action.payload; 
      })
      .addCase(fetchEnvironmentData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      })
      .addCase(editEnvironment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEnvironment.fulfilled, (state, action: PayloadAction<Environment>) => {
        state.loading = false;
        const index = state.environmentList.findIndex((environment) => environment.id === action.payload.Environment_Id);
        if (index !== -1) {
          state.environmentList[index] = action.payload; 
        }
      })
      .addCase(editEnvironment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An error occurred';
      });
  },
});

export default environmentSlice.reducer;
export const { setEditEnvironmentData } = environmentSlice.actions;