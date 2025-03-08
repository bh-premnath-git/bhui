import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { apiService } from '@/lib/api/api-service';
import { CATALOG_API_PORT } from '@/config/platformenv';

const token: any = sessionStorage?.getItem("token");
const decoded: any = token ? jwtDecode(token) : null;

// Define proper interfaces for the state and responses
export interface Pipeline {
  pipeline_id: number;
  name: string;
  updated_by: string;
  // Add other pipeline properties
}

export interface DataSource {
  id: number;
  name: string;
  // Add other data source properties
}

export interface TransformationMetrics {
  outputs: any[];
  // Add other metrics properties
}

export interface BuildPipelineState {
  dataSource: DataSource[];
  dataConfig: any[];
  loading: boolean;
  error: string | null;
  isHover: boolean;
  selectedOption: string;
  isPipelineRunning: boolean;
  dynamicConData: any;
  pipelineList: Pipeline[];
  nestedFields: any;
  orderByList: any[];
  createPipeLineDtl: any;
  buildPipeLineDtl: any;
  nodesList: any[];
  tranformationCount: any;
  isDebug: boolean;
  metricsData: TransformationMetrics | null;
  isMetricsLoading: boolean;
  listedContentTpes: any;
  pipelineDtl:any;
  aiSuggestion:any;
}

const initialState: BuildPipelineState = {
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
  listedContentTpes: {},
  pipelineDtl:null,
  aiSuggestion:''
};

interface ApiResponse {
  id: number;
  name: string;
}

// Async thunk with proper typing
export const getSource = createAsyncThunk<DataSource[], void>(
  'build-pipeline/datasource',
  async () => {
    const response = await apiService.get<DataSource[]>({
      portNumber: CATALOG_API_PORT,
      url: 'api/v1/data_source/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch data sources'
      }
    });
    return response;
  }
);

export const getConfig: any = createAsyncThunk(
  'build-pipline/getConfig',
  async (params: any, thunkAPI) => {
    // alert(JSON.stringify(params))
    try {
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: '/connection_registry/list/',
        usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: '/connection_registry/connections_json/list/',
        usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.post({
        portNumber: CATALOG_API_PORT,
        url: '/pipeline',
        usePrefix: true,
        method: 'POST',
        data:body
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getAllPipeline = createAsyncThunk<Pipeline[], void>(
  'build-pipeline/getAllPipeline',
  async () => {
    const response = await apiService.get<Pipeline[]>({
      portNumber: CATALOG_API_PORT,
      url: '/pipeline/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch pipelines'
      }
    });
    
    return response.map((item) => ({
      ...item,
      updated_by: decoded?.name ?? ""
    }));
  }
);

export const getCodesValue: any = createAsyncThunk(
  'build-pipline/getCodesValue',
  async (params: any, thunkAPI) => {
    try {
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/codes_hdr/${params.value}`,
        usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/codes_hdr/${params.value}`,
        usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,url: `/pipeline/debug/get_transformation_count`,usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/pipeline/debug/get_transformation_output`,
        usePrefix: true,
        method: 'GET',
        params
      });
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
      const response = await apiService.post({
        portNumber: CATALOG_API_PORT,
        url: `/pipeline/debug/start_pipeline`,
        usePrefix: true,
        method: 'POST',
        data:params
      });
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
      const response = await apiService.post({
        portNumber: CATALOG_API_PORT,
        url: `/pipeline/debug/stop_pipeline`,
        usePrefix: true,
        method: 'POST',
        data:params
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getPipelineById: any = createAsyncThunk(
  'build-pipline/getPipelineById',
  async (params: any, thunkAPI) => {
    try {
      const response = await apiService.get({
        portNumber: CATALOG_API_PORT,
        url: `/pipeline/${params.id}`,
        usePrefix: true,
        method: 'GET',
        params
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTransformationOutput = createAsyncThunk<
  TransformationMetrics,
  { pipelineName: string; transformationName: string }
>(
  'pipeline/fetchTransformationOutput',
  async ({ pipelineName, transformationName }) => {
    const response = await apiService.get<TransformationMetrics>({
      portNumber: CATALOG_API_PORT,
      url: `/pipeline/debug/get_transformation_output`,
      usePrefix: true,
      method: 'GET',
      params: {
        pipeline_name: pipelineName,
        transformation_name: transformationName,
        page: 1,
        page_size: 50,
      }
    });

    if ('error' in response) {
      throw new Error(response.error as string);
    }

    return response;
  }
);

export const deletePipelineById = createAsyncThunk(
  'build-pipeline/deletePipelineById',
  async (pipelineId: number) => {
    await apiService.delete({
      portNumber: CATALOG_API_PORT,
      url: `/pipeline/${pipelineId}`,
      usePrefix: true,
      method: 'DELETE',
      metadata: {
        errorMessage: 'Failed to delete pipeline'
      }
    });
    return pipelineId;
  }
);

export const updatePipeline = createAsyncThunk(
  'build-pipeline/updatePipeline',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await apiService.patch({
      portNumber: CATALOG_API_PORT,
      url: `/pipeline/${id}`,
      usePrefix: true,
      method: 'PATCH',
      data,
      metadata: {
        errorMessage: 'Failed to update pipeline'
      }
    });
    return response;
  }
);

export const runNextCheckpoint = createAsyncThunk(
  'build-pipline/runNextCheckpoint',
  async (params: { pipeline_name: string }, thunkAPI) => {
    try {
      const response = await apiService.post({
        portNumber: CATALOG_API_PORT,
        url: '/pipeline/run-next-checkpoint',
        usePrefix: true,
        method: 'POST',
        data: params
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// New Async thunk for generating pipeline agent
export const generatePipelineAgent = createAsyncThunk(
  'build-pipline/generatePipelineAgent',
  async ({ schemaString, targetColumn }: { schemaString: string; targetColumn: string }, thunkAPI) => {
    try {
      const response = await apiService.post({
        portNumber: '8090',
        url: '/api/v1/pipeline_agent/generate',
        usePrefix: true,
        method: 'POST',
        data: {
          operation_type: "spark_expression",
          params: {
            schema: schemaString,
            target_column: targetColumn
          },
          thread_id: "spark_123"
        }
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const buildPipeLineSlice = createSlice({
  name: "buildPipeline",
  initialState,
  reducers: {
    setIsHover: (state, action: PayloadAction<boolean>) => {
      state.isHover = action.payload;
    },
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
    },
    setIsPipelineRunning: (state, action: PayloadAction<boolean>) => {
      state.isPipelineRunning = action.payload;
    },
    setIsDebug: (state, action: PayloadAction<boolean>) => {
      state.isDebug = action.payload;
    },
    setNestedField: (state, action: PayloadAction<any>) => {
      state.nestedFields = action.payload;
    },
    setBuildPipeLineDtl: (state, action: PayloadAction<any>) => {
      state.buildPipeLineDtl = action.payload;
    },
    setBuildPipeLineNodes: (state, action: PayloadAction<any[]>) => {
      state.nodesList = action.payload;
    },
    setIsRun: (state, action: PayloadAction<boolean>) => {
      state.isPipelineRunning = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSource.fulfilled, (state, action: PayloadAction<DataSource[]>) => {
        state.loading = false;
        state.dataSource = action.payload;
      })
      .addCase(getSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data sources';
      })
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
      .addCase(getAllPipeline.fulfilled, (state, action: PayloadAction<Pipeline[]>) => {
        state.loading = false;
        state.pipelineList = action.payload;
      })
      .addCase(getAllPipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pipelines';
      })


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

      .addCase(getPipelineById.pending, (state) => {
        state.isMetricsLoading = true;
      })
      .addCase(getPipelineById.fulfilled, (state, action) => {
        state.isMetricsLoading = false;
        state.pipelineDtl = action.payload;
        state.error = null;
      })
      .addCase(getPipelineById.rejected, (state, action) => {
        state.isMetricsLoading = false;
        state.error = action.error.message || 'Failed to fetch metrics';
      })

      .addCase(deletePipelineById.fulfilled, (state, action) => {
        state.loading = false;
        state.pipelineList = state.pipelineList.filter(p => p.pipeline_id !== action.payload);
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

      .addCase(updatePipeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state with the response if needed
      })
      .addCase(updatePipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update pipeline';
      })

      .addCase(runNextCheckpoint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runNextCheckpoint.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state with the response if needed
      })
      .addCase(runNextCheckpoint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to run next checkpoint';
      })

      .addCase(generatePipelineAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePipelineAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.aiSuggestion=action.payload;
        // Handle the response as needed
      })
      .addCase(generatePipelineAgent.rejected, (state, action) => {
        state.loading = false;
        state.error =null;
      })
  }
});

export default buildPipeLineSlice.reducer;
export const {
  setIsHover,
  setSelectedOption,
  setIsPipelineRunning,
  setNestedField,
  setBuildPipeLineDtl,
  setBuildPipeLineNodes,
  setIsDebug,
  setIsRun
} = buildPipeLineSlice.actions;