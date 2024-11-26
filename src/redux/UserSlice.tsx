// redux/UserSlice.ts

import { ApiService } from '@/services/apiServices';
import { LocalStorageService } from "@/services/localStorageServices";
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
      const response = await ApiService('8005', 'get', '/users', null, params, null, false);
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
        '8005',
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
    // Handle getUserDataList
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

    // Handle createUserDeployment
    builder
      .addCase(createUserDeployment.pending, (state) => {
        state.loadingDeployment = true;
        state.errorDeployment = null;
      })
      .addCase(
        createUserDeployment.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loadingDeployment = false;
          // Assuming the response contains the newly created user
          state.userDataList.push(action.payload);
        }
      )
      .addCase(
        createUserDeployment.rejected,
        (state, action: PayloadAction<string>) => {
          state.loadingDeployment = false;
          state.errorDeployment = action.payload;
        }
      );
  },
});

export default UserSlice.reducer;
export const { clearErrors, resetState } = UserSlice.actions;

