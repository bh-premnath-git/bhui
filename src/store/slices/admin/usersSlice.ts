import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/lib/api/api-service";
import { CATALOG_REMOTE_API_URL } from "@/config/platformenv";
import { User } from '@/types/admin/user';
import { Project } from "@/types/admin/project";
import { Environment } from "@/types/admin/environment";

// Define paginated response types
interface PaginatedResponse<T> {
  total: number;
  next: boolean;
  prev: boolean;
  offset: number;
  limit: number;
  data: T[];
}

interface UsersState {
  users: User[];
  selectedUser: User | null;
  projects: Project[];
  environments: Environment[];
  loading: boolean;
  error: string | null;
  isLoading: boolean;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  projects: [],
  environments: [],
  loading: false,
  error: null,
  isLoading: false,
};

export const fetchProjects = createAsyncThunk(
  "users/fetchProjects",
  async () => {
    const response = await apiService.get<PaginatedResponse<Project>>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/bh_project/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch projects'
      }
    });
    return response.data; // Extract the data array from paginated response
  }
);

export const fetchEnvironments = createAsyncThunk(
  "users/fetchEnvironments",
  async () => {
    const response = await apiService.get<PaginatedResponse<Environment>>({
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/environment/environment/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch environments'
      }
    });
    return response.data; // Extract the data array from paginated response
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(fetchEnvironments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnvironments.fulfilled, (state, action: PayloadAction<Environment[]>) => {
        state.isLoading = false;
        state.environments = action.payload;
        state.error = null;
      })
      .addCase(fetchEnvironments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch environments';
      });
  },
});

export const { setUsers, setSelectedUser, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer;
