import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/lib/api/api-service";
import { KEYCLOAK_API_PORT, CATALOG_API_PORT } from "@/config/platformenv";
import { User } from '@/types/admin/user';
import { Project } from "@/types/admin/project";


interface UsersState {
  users: User[];
  selectedUser: User | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
  isLoading: boolean;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  projects: [],
  loading: false,
  error: null,
  isLoading: false,
};

export const fetchProjects = createAsyncThunk(
  "users/fetchProjects",
  async () => {
    const response = await apiService.get<Project[]>({
      portNumber: CATALOG_API_PORT,
      url: '/bh_project/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch projects'
      }
    });
    return response;
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
      });
  },
});

export const { setUsers, setSelectedUser, setLoading, setError } = usersSlice.actions;
export default usersSlice.reducer;
