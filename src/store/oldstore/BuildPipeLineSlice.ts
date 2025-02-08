import { ApiService } from '@/services/apiServices';
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { CATALOG_API_PORT } from "@/services/environment";

const token: any = sessionStorage?.getItem("token");
const decoded: any = token ? jwtDecode(token) : null;

export interface ApiState {
  dataSource: any;
  dataConfig: any;
  loading: boolean;
  error: string | null;
  isHover: boolean;
  selectedOption: string;
  isPipelineRunning: boolean;
  dynamicConData: any;
  pipelineList: any;
  nestedFields: any;
  orderByList: any;
  createPipeLineDtl: any;
  buildPipeLineDtl: any;
  nodesList: any,
  tranformationCount: any;
  isDebug: boolean;
  metricsData: any;
  isMetricsLoading: boolean;
  listedContentTpes: any
}

const initialState: ApiState = {
  loading: false,
  error: null,
  dataSource: [],
  dataConfig: [],
  isHover: false,
  selectedOption: '',
  isPipelineRunning: false,
  dynamicConData: null,
  nestedFields: null,
  pipelineList: [],
  orderByList: [],
  createPipeLineDtl: {},
  buildPipeLineDtl: {},
  nodesList: [],
  tranformationCount: {},
  isDebug: false,
  metricsData: null,
  isMetricsLoading: false,
  listedContentTpes: {}
};

interface ApiResponse {
  id: number;
  name: string;
}

export const getSource: any = createAsyncThunk(
  'build-pipline/detasource',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', '/data_source/list/', null, params);
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
      const response = await ApiService(CATALOG_API_PORT, 'get', '/connection_registry/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const getDynamicCon: any = createAsyncThunk(
  'build-pipline/getDynamicCon',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', '/connection_registry/connections_json/list/', null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const insertPipeline: any = createAsyncThunk(
  'build-pipline/insertPipeline',
  async (body: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService(CATALOG_API_PORT, 'post', '/pipeline', body);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const getAllPipeline: any = createAsyncThunk(
  'build-pipline/getAllPipeline',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', '/pipeline/list/', null, params);
      const transformed = response.map((item: any) => ({
        ...item,
        updated_by: decoded?.name ?? ""
      }));
      return transformed;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
export const getCodesValue: any = createAsyncThunk(
  'build-pipline/getCodesValue',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', `/codes_hdr/${params.value}`, null);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getOrderBy: any = createAsyncThunk(
  'build-pipline/getOrderBy',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', `/codes_hdr/${params.value}`, null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const getTransformationCount: any = createAsyncThunk(
  'build-pipline/getTransformationCount',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', `/pipeline/debug/get_transformation_count`, null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const getTransformationOutput: any = createAsyncThunk(
  'build-pipline/getTransformationOutput',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'get', `/pipeline/debug/get_transformation_output`, null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const startPipeLine: any = createAsyncThunk(
  'build-pipline/startPipeLine',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'post', `/pipeline/debug/start_pipeline`, null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


export const stopPipeLine: any = createAsyncThunk(
  'build-pipline/stopPipeLine',
  async (params: any, thunkAPI) => {
    try {
      const response = await ApiService(CATALOG_API_PORT, 'post', `/pipeline/debug/stop_pipeline`, null, params);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTransformationOutput = createAsyncThunk(
  'pipeline/fetchTransformationOutput',
  async ({ pipelineName, transformationName }: { pipelineName: string, transformationName: string }) => {
    const response = await ApiService(
      CATALOG_API_PORT,
      "get",
      `/pipeline/debug/get_transformation_output`,
      null,
      {
        pipeline_name: pipelineName,
        transformation_name: transformationName?.toLowerCase(),
        page: 1,
        page_size: 50,
        // sort_columns: 'id',
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.outputs;
  }
);

export const deletePipelineById = createAsyncThunk(
  'build-pipline/deletePipelineById',
  async (params: any, thunkAPI) => {
    try {
      await ApiService(CATALOG_API_PORT, 'delete', `/pipeline/${params.pipeline_id}`, null, {});
      return params.pipeline_id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete pipeline.');
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
    setIsPipelineRunning: (state, action) => {
      state.isPipelineRunning = action.payload;
    },
    setIsDebug: (state, action) => {
      state.isDebug = action.payload;
    },
    setNestedField: (state, action) => {
      state.nestedFields = action.payload;
    },
    setBuildPipeLineDtl: (state, action) => {
      state.buildPipeLineDtl = action.payload;
    },
    setBuildPipeLineNodes: (state, action) => {
      state.nodesList = action.payload;
    },
    setIsRun: (state, action) => {
      state.isPipelineRunning = action.payload;
    }

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

        }
      )
      .addCase(
        getConfig.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(getDynamicCon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getDynamicCon.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.dynamicConData = action.payload;

        }
      )
      .addCase(
        getDynamicCon.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(insertPipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        insertPipeline.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.createPipeLineDtl = action.payload;

        }
      )
      .addCase(
        insertPipeline.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getAllPipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllPipeline.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.pipelineList = action.payload;

        }
      )
      .addCase(
        getAllPipeline.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      .addCase(getOrderBy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrderBy.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.orderByList = action.payload;
        }
      )
      .addCase(
        getOrderBy.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getTransformationCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getTransformationCount.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.tranformationCount = action.payload;
        }
      )
      .addCase(
        getTransformationCount.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(getTransformationOutput.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getTransformationOutput.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.orderByList = action.payload;
        }
      )
      .addCase(
        getTransformationOutput.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(startPipeLine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        startPipeLine.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.orderByList = action.payload;
        }
      )
      .addCase(
        startPipeLine.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(stopPipeLine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        stopPipeLine.fulfilled,
        (state, action: PayloadAction<ApiResponse[]>) => {
          state.loading = false;
          state.orderByList = action.payload;
        }
      )
      .addCase(
        stopPipeLine.rejected,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(fetchTransformationOutput.pending, (state) => {
        state.isMetricsLoading = true;
      })
      .addCase(fetchTransformationOutput.fulfilled, (state, action) => {
        state.isMetricsLoading = false;
        state.metricsData = action.payload;
        state.error = null;
      })
      .addCase(fetchTransformationOutput.rejected, (state, action) => {
        state.isMetricsLoading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
      .addCase(deletePipelineById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePipelineById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.pipelineList = state.pipelineList.filter(p => p.pipeline_id !== action.payload.pipeline_id);
      })
      .addCase(deletePipelineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
      .addCase(getCodesValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCodesValue.fulfilled, (state, action: any) => {
        state.loading = false;
        state.listedContentTpes = action.payload;
      })
      .addCase(getCodesValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })
  }
});

export default buildPipeLineSlice.reducer;
export const { setIsHover,
  setSelectedOption,
  setIsPipelineRunning,
  setNestedField,
  setBuildPipeLineDtl,
  setBuildPipeLineNodes,
  setIsDebug, setIsRun } = buildPipeLineSlice.actions;