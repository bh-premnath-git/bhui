import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/lib/api/api-service";
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";

export interface GithubProvider {
  id: number;
  codes_hdr_id: number;
  dtl_desc: string;
  dtl_id_filter: number;
}

export interface DataSourceType {
  id: number;
  codes_hdr_id: number;
  dtl_desc: string;
  dtl_id_filter: number;
}
export interface DataTypeId {
  codes_dtl: DataSourceType[]
  description: string;
  id: number;
  type_cd: string;
}
export interface GithubProvidersResponse {
  id: number;
  description: string;
  type_cd: string;
  codes_dtl: GithubProvider[];
}

interface GlobalState {
  githubProviders: GithubProvidersResponse | null;
  dataSourceTypes: DataTypeId | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GlobalState = {
  githubProviders: null,
  dataSourceTypes: null,
  isLoading: false,
  error: null,
};

export const fetchGithubProviders = createAsyncThunk(
  "global/fetchGithubProviders",
  async () => {
    const response = await apiService.get<GithubProvidersResponse>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/codes_hdr/30',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch GitHub providers'
      }
    });
    return response;
  }
);

export const fetchDataSourceTypes = createAsyncThunk(
  "global/fetchDataSourceTypes",
  async () => {
    const response = await apiService.get<DataTypeId>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/codes_hdr/13',
      method: 'GET',
      usePrefix: true,
      metadata: {
        errorMessage: 'Failed to fetch data source types.',
      },
    });
    return response;
  }
)

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGithubProviders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchGithubProviders.fulfilled,
        (state, action: PayloadAction<GithubProvidersResponse>) => {
          state.isLoading = false;
          state.githubProviders = action.payload;
        }
      )
      .addCase(fetchGithubProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch GitHub providers";
      })
      .addCase(fetchDataSourceTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDataSourceTypes.fulfilled,
        (state, action: PayloadAction<DataTypeId>) => {
          state.isLoading = false;
          state.dataSourceTypes = action.payload;
        }
      )
      .addCase(fetchDataSourceTypes.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch data source types';
      });
  },
});

export default globalSlice.reducer;
