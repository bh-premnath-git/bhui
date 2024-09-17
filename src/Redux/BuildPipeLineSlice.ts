import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import ApiService from "../Services/ApiServices";

export interface ApiState {
  dataSource: any;
  dataConfig: any;
  loading: boolean;
  error: string | null;
  isHover: boolean;
  selectedOption: string;
  isRun: boolean;
}

const initialState: ApiState = {
  loading: false,
  error: null,
  dataSource: [],
  dataConfig: [],
  isHover: false,
  selectedOption: '',
  isRun: false
};

interface ApiResponse {
  id: number;
  name: string;
}

export const getSource: any = createAsyncThunk(
  'build-pipline/detasource',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService('8011', 'get', '/data_source/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getConfig: any = createAsyncThunk(
  'build-pipline/getConfig',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService('8011', 'get', '/connection_registry/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const buildPipeLineSlice = createSlice({
  name: "api/buildDataPipeline",
  initialState,
  reducers: {
    setIsHover: (state, action) => {
      state.isHover = action.payload;
    },
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    setIsRun: (state, action) => {
      state.isRun = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getSource.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.dataSource = action.payload;
          // if (state.searchProjectList?.length === 0) {
          //   state.searchProjectList = action.payload;
          // }
        }
      )
      .addCase(
        getSource.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(getConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getConfig.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.dataConfig = action.payload;
          // if (state.searchProjectList?.length === 0) {
          //   state.searchProjectList = action.payload;
          // }
        }
      )
      .addCase(
        getConfig.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
  },
});

export default buildPipeLineSlice.reducer;
export const { setIsHover, setSelectedOption, setIsRun } = buildPipeLineSlice.actions;