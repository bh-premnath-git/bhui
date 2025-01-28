// redux/UserSlice.ts

import { KEYCLOAK_API_PORT } from '@/configration/environment';
import { ApiService } from '@/services/apiServices';
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  userDataList: any;
  loadingUsers: boolean;
  loadingDeployment: boolean;
  errorUsers: string | null;
  errorDeployment: string | null;
}

const initialState: ApiState = {
  loadingUsers: false,
  loadingDeployment: false,
  errorUsers: null,
  errorDeployment: null,
  userDataList: []
};

interface ApiResponse {
  id: number;
  name: string;
}

// Fetch User Data List
export const getUserDataList = createAsyncThunk<
  ApiResponse[],
  any,
  { rejectValue: string }
>(
  'user/getUserDataList',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(KEYCLOAK_API_PORT, 'get', '/users', null, params, null, false);
      return response.users;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


// Create User Deployment
export const createUserDeployment = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>(
  'user/deployment/create',
  async (params, thunkAPI) => {
    try {
      const response = await ApiService(
        KEYCLOAK_API_PORT,
        'post',
        '/users',
        params, null, {}, false
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editUserDeployment = createAsyncThunk<
  any,
  { id: any; params: any },
  { rejectValue: string }
>(
  'user/deployment/edit',
  async ({ id, params }, thunkAPI) => {
    try {
      const response = await ApiService(
        KEYCLOAK_API_PORT,
        'put',
        `/users/${id}`,
        params, null, {}, false
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const UserSlice = createSlice({
  name: "api/buildDataPipeline",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errorUsers = null;
      state.errorDeployment = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDataList.pending, (state) => {
        state.loadingUsers = true;
        state.errorUsers = null;
      })
      .addCase(
        getUserDataList.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loadingUsers = false;
          state.userDataList = action.payload;
        }
      )
      .addCase(
        getUserDataList.rejected,
        (state, action: PayloadAction<string>) => {
          state.loadingUsers = false;
          state.errorUsers = action.payload;
        }
      );
    builder
      .addCase(createUserDeployment.pending, (state) => {
        state.loadingDeployment = true;
        state.errorDeployment = null;
      })
      .addCase(
        createUserDeployment.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loadingDeployment = false;
          state.userDataList.push(action.payload);
        }
      )
      .addCase(
        createUserDeployment.rejected,
        (state, action: PayloadAction<string>) => {
          state.loadingDeployment = false;
          state.errorDeployment = action.payload;
        }
      )
      .addCase(editUserDeployment.pending, (state) => {
        state.loadingDeployment = true;
        state.errorDeployment = null;
      })
      .addCase(
        editUserDeployment.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loadingDeployment = false;
          const index = state.userDataList.findIndex(
            (user: ApiResponse) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.userDataList[index] = { ...state.userDataList[index], ...action.payload };
          }
        }
      )
      .addCase(
        editUserDeployment.rejected,
        (state, action: PayloadAction<string>) => {
          state.loadingDeployment = false;
          state.errorDeployment = action.payload;
        }
      );
  },
});

export default UserSlice.reducer;
export const { clearErrors, resetState } = UserSlice.actions;

