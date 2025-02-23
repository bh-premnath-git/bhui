import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/lib/api/api-service";
import { CATALOG_API_PORT } from "@/config/platformenv";

export interface GithubProvider {
  id: number;
  codes_hdr_id: number;
  dtl_desc: string;
  dtl_id_filter: number;
}

export interface GithubProvidersResponse {
  id: number;
  description: string;
  type_cd: string;
  codes_dtl: GithubProvider[];
}

interface GlobalState {
  githubProviders: GithubProvidersResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GlobalState = {
  githubProviders: null,
  isLoading: false,
  error: null,
};

export const fetchGithubProviders = createAsyncThunk(
  "global/fetchGithubProviders",
  async () => {
    const response = await apiService.get<GithubProvidersResponse>({
      portNumber: CATALOG_API_PORT,
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
      });
  },
});

export default globalSlice.reducer;
