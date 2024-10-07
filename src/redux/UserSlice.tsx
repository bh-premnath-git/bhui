import ApiService from "@/Services/ApiServices";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  userDataList: any;
  loading: boolean;
  error: string | null;

}

const initialState: ApiState = {
  loading: false,
  error: null,
  userDataList: [],
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



const UserSlice = createSlice({
  name: "api/buildDataPipeline",
  initialState,
  reducers: {
   

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


  },
});

export default UserSlice.reducer;
// export const { setSelectedDataSource } = UserSlice.actions;