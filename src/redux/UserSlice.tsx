import {ApiService} from '@/services/apiServices';
import {LocalStorageService} from "@/services/localStorageServices";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  userDataList: any;
  codesDtl: any;
  loading: boolean;
  error: string | null;


}

const initialState: ApiState = {
  loading: false,
  error: null,
  userDataList: [],
  codesDtl: []
};

interface ApiResponse {
  id: number;
  name: string;
}

export const getUserDataList: any = createAsyncThunk(
  'user/getUserDataList',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService('8011', 'get', '/bh_user/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const getCodesDtl: any = createAsyncThunk(
  'user/getCodesDtl',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {

      let data =await LocalStorageService.getItem('codesDtl');
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);



const UserSlice = createSlice({
  name: "api/buildDataPipeline",
  initialState,
  reducers: {
    setCodesData: (state,pa) => {
      let data = LocalStorageService.getItem('codesDtl');
      state.codesDtl = data;
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDataList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserDataList.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.userDataList = action.payload;

        }
      )
      .addCase(
        getUserDataList.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getCodesDtl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCodesDtl.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.codesDtl = action.payload;

        }
      )
      .addCase(
        getCodesDtl.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


  },
});

export default UserSlice.reducer;
export const { setCodesData } = UserSlice.actions;