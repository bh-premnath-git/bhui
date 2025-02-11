import { ApiService } from "@/services/api.services";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CATALOG_API_PORT } from "@/services/environment";

export interface ApiState {
  loading: any;
  error: any;
}

const initialState: ApiState = {
  loading: false,
  error: null,
};

interface ApiResponse {
  id: number;
  name: string;
}

export const getdataSourceList: any = createAsyncThunk(
  'catalog/detasource',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService({
        portNumber: CATALOG_API_PORT,
        method: 'get',
        url: '/data_source/list/',
        params: params,
        data: null
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const ExploreSlice = createSlice({
  name: "api/ExploreSlice",
  initialState,
  reducers: {
    setSelectedDataSource: (state, action) => {
      // state.selectedDataSource = action.payload;
    },
    // setSelectedOption: (state, action) => {
    //   state.selectedOption = action.payload;
    // },
    // setIsRun: (state, action) => {
    //   state.isRun = action.payload;
    // },
    // setNestedField: (state, action) => {
    //   state.nestedFields = action.payload;
    // },
  },
  extraReducers: (builder) => {
  },
});

export default ExploreSlice.reducer;
export const { setSelectedDataSource } = ExploreSlice.actions;