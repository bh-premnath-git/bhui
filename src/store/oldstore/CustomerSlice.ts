import { CATALOG_API_PORT } from '@/services/environment';
import { ApiService } from "@/services/api.services";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  customerList: any;
  loading: boolean;
  error: string | null;

}

const initialState: ApiState = {
  loading: false,
  error: null,
  customerList: []

};

interface ApiResponse {
  id: number;
  name: string;
}

export const getCustomerList: any = createAsyncThunk(
  'customer/list',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService({
        portNumber: CATALOG_API_PORT,
        method: 'get',
        url: '/customer/list/',
        params: params
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const CustomerSlice = createSlice({
  name: "api/customer",
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCustomerList.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.customerList = action.payload;
        }
      )
      .addCase(
        getCustomerList.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
  },
});

export default CustomerSlice.reducer;
