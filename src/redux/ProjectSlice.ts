import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ApiService from "../services/ApiServices";

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
  param: { },
  editProjectData: {}
};

interface ApiResponse {
  bh_project_id: number;
  name: string;
}

export const getGitProject: any = createAsyncThunk(
  'admin-console/gitproject',
  async (params: any, thunkAPI) => {
    alert(JSON.stringify(params))
    try {
      const response = await ApiService('8011', 'get', '/bh_project/list/', null, params);
      return response;
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
      const response = await ApiService('8011', 'put', `/bh_project/${bh_project_id}/`, updateData);
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
          alert(JSON.stringify(action.payload))
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
      );
  },
});

export default projectSlice.reducer;
export const { setEditProjectData } = projectSlice.actions;
