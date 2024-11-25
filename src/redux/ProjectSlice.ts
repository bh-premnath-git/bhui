import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ApiService } from "@/services/apiServices";

export interface ApiState {
  gitProjectList: any;
  searchProjectList: any;
  editProjectData: any;
  loading: boolean;
  error: string | null;
  param: any;
}

const initialState: ApiState = {
  loading: false,
  error: null,
  gitProjectList: [],
  searchProjectList: [],
  param: {},
  editProjectData: {}
};

interface ApiResponse {
  bh_project_id: number;
  name: string;
}

interface CreateProjectData {
  bh_project_name: string;
  bh_github_provider: number;
  bh_github_username: string;
  bh_github_email: string;
  bh_default_branch: string;
  bh_github_url: string;
  bh_github_token_url: string;
  status: string;
  tags: Record<string, any>;
}

export const getGitProject: any = createAsyncThunk(
  'admin-console/gitproject',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', '/bh_project/list/', null, params);
      const transformed: any[] = response.map((item: any) => {
        return {
          Project_Name: item.bh_project_name,
          ["YTD_Cost ($)"]: item.ytd_cost,
          ["Current_Month_Cost ($)"]: item.current_month_cost,
          ["Total Storage (GB)"]: item.total_storage,
          total_data_sources: item.total_data_sources,
          status: item.status,
          ...item
        }
      })
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateProject: any = createAsyncThunk(
  'admin-console/updateProject',
  async (projectData: any, thunkAPI) => {
    try {
      const { bh_project_id, ...updateData } = projectData;
      const {
        ["Project_Name"]: _,
        ["YTD_Cost ($)"]: __,
        ["Current_Month_Cost ($)"]: ___,
        ["Total Storage (GB)"]: ____,
        ...remain
      } = updateData;
      const response = await ApiService('8011', 'put', `/bh_project/${bh_project_id}/`, remain);
      const transformed = {
        Project_Name: response.bh_project_name,
        ["YTD_Cost ($)"]: response.ytd_cost,
        ["Current_Month_Cost ($)"]: response.current_month_cost,
        ["Total Storage (GB)"]: response.total_storage,
        total_data_sources: response.total_data_sources,
        status: response.status,
        ...response
      }

      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const createProjectDeployment = createAsyncThunk<
  any,
  any,
  {
    rejectValue: string;
  }
>(
  'project/deployment/create',
  async (params, thunkAPI) => {
    try {
      const response = await ApiService(
        '8005',
        'post',
        '/projects',
        params, null, {}, false
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createProject: any = createAsyncThunk(
  'All Projects/New',
  async (projectData: CreateProjectData, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'post', '/bh_project/', projectData);
      const deployPayload = {
        name: response.bh_project_name,
        description: `${response.bh_project_name} deployment`,
      }
      const deploymentResult = await thunkAPI.dispatch(createProjectDeployment(deployPayload));
      if (createProjectDeployment.rejected.match(deploymentResult)) {
        // Deployment failed; throw an error to indicate partial success
        throw new Error(`Project created but deployment failed: ${deploymentResult.payload}`);
      }
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const searchProject: any = createAsyncThunk(
  'prjects/searchProject',
  async (value: string, thunkAPI) => {
    try {
      const response = await ApiService('8011', 'get', `/bh_project/search?bh_project_name=${value}`);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);



const projectSlice = createSlice({
  name: "api/project",
  initialState,
  reducers: {
    setEditProjectData: (state, action) => {
      state.editProjectData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGitProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getGitProject.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.gitProjectList = action.payload;
          if (state.searchProjectList?.length === 0) {
            state.searchProjectList = action.payload;
          }
        }
      )
      .addCase(
        getGitProject.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProject.fulfilled,
        (state, action: PayloadAction<ApiResponse>) => {
          state.loading = false;
          const index = state.gitProjectList.findIndex(
            (project: ApiResponse) => project?.bh_project_id == action.payload?.bh_project_id
          );
          if (index !== -1) {
            state.gitProjectList[index] = action.payload;
          }
        }
      )
      .addCase(
        updateProject.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<ApiResponse>) => {
          state.loading = false;
          state.gitProjectList.push(action.payload);
          state.searchProjectList.push(action.payload);
        }
      )
      .addCase(
        createProject.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(createProjectDeployment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectDeployment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createProjectDeployment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Deployment failed';
      })
      .addCase(searchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        searchProject.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.searchProjectList = action.payload;
        }
      )
      .addCase(
        searchProject.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export default projectSlice.reducer;
export const { setEditProjectData } = projectSlice.actions;