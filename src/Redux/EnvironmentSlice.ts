import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ApiService from "../Services/ApiServices";
import Environment from "../pages/Admin-Console/Project/Component/Environment";

export interface Environment {
  id: string;
  name: string;
  // Add other environment properties here
}

export interface EnvironmentState {
  environmentList: Environment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnvironmentState = {
  environmentList: [],
  loading: false,
  error: null,
};

interface CreateEnvironmentData {
  bh_env_name: string;
  bh_env_provider: number;
  cloud_provider_cd: number;
  cloud_region_cd: number;
  status_cd: number;
  project_id: string;
  location?: string;
  tags?: string;
  file?: File;
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

      if (environmentData.file) {
        data = new FormData();
        Object.entries(environmentData).forEach(([key, value]) => {
          if (value !== undefined) {
            data.append(key, value);
          }
        });
      } else {
        data = environmentData;
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await ApiService('8011', 'post', '/bh_project/project_environment/', data, null, headers);
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
      const response = await ApiService('8011', 'get', '/env/environment/list/', null, null);
      const transformed = response.map((item: any) => {
        return ({
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

const environmentSlice = createSlice({
  name: "api/environment",
  initialState,
  reducers: {},
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
      });
  },
});

export default environmentSlice.reducer;