import ApiService from "@/Services/ApiServices";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  dataSourceList: any;
  loading: boolean;
  error: string | null;

}

const initialState: ApiState = {
  loading: false,
  error: null,
  dataSourceList: [],

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
      const response = await ApiService('8011', 'get', '/data_source/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const CatalogSlice = createSlice({
  name: "api/buildDataPipeline",
  initialState,
  reducers: {
    // setIsHover: (state, action) => {
    //   state.isHover = action.payload;
    // },
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
    builder
      .addCase(getdataSourceList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getdataSourceList.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.dataSourceList = action.payload;
          // if (state.searchProjectList?.length === 0) {
          //   state.searchProjectList = action.payload;
          // }
        }
      )
      .addCase(
        getdataSourceList.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

  },
});

export default CatalogSlice.reducer;
// export const { setIsHover, setSelectedOption, setIsRun, setNestedField } = CatalogSlice.actions;