import { ApiService } from "@/services/apiServices";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ApiState {
  dataSourceList: any[];      // list of all data sources
  layoutList: any[];          // layout details for a specific data source
  selectedDataSource: object; // whichever data source you’ve clicked on
  listLoading: boolean;       // loading flag for the data source list
  layoutLoading: boolean;     // loading flag for the layout
  error: string | null;
}

const initialState: ApiState = {
  dataSourceList: [],
  layoutList: [],
  selectedDataSource: {},
  listLoading: false,
  layoutLoading: false,
  error: null,
};

interface ApiResponse {
  id: number;
  name: string;
}

/**
 *  Fetch full list of data sources.
 */
export const getdataSourceList = createAsyncThunk(
  "catalog/datasource",
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(
        "8011",
        "get",
        "/data_source/list/",
        null,
        params
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/**
 *  Fetch layout for a specific data source.
 */
export const getDataSourceLayout = createAsyncThunk(
  "catalog/data_source_layout",
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(
        "8011",
        "get",
        "/data_source_layout/list_full/",
        null,
        params
      );
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const CatalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setSelectedDataSource: (state, action: PayloadAction<any>) => {
      state.selectedDataSource = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------------------
      //   getdataSourceList
      // ---------------------------
      .addCase(getdataSourceList.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(
        getdataSourceList.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.listLoading = false;
          state.dataSourceList = action.payload;
        }
      )
      .addCase(getdataSourceList.rejected, (state, action: PayloadAction<any>) => {
        state.listLoading = false;
        state.error = action.payload;
      })

      // ---------------------------
      //   getDataSourceLayout
      // ---------------------------
      .addCase(getDataSourceLayout.pending, (state) => {
        state.layoutLoading = true;
        state.error = null;
      })
      .addCase(
        getDataSourceLayout.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.layoutLoading = false;
          state.layoutList = action.payload;
        }
      )
      .addCase(getDataSourceLayout.rejected, (state, action: PayloadAction<any>) => {
        state.layoutLoading = false;
        state.error = action.payload;
      });
  },
});

export default CatalogSlice.reducer;
export const { setSelectedDataSource } = CatalogSlice.actions;
