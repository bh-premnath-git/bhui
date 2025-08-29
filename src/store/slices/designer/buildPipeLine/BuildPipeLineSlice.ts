import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { apiService } from '@/lib/api/api-service';
import { AGENT_REMOTE_URL, CATALOG_LIVE_API_URL, CATALOG_REMOTE_API_URL, ENVIRONMENT, USE_SECURE, SPARK_PORT, PANDAS_PORT, FLINK_PORT } from '@/config/platformenv';
import { SerializedError } from "@reduxjs/toolkit";
import { setPipeLineName } from "../features/autoSaveSlice";
import { ValidEngineTypes, getAvailableEngineTypes } from '@/types/pipeline';

const token: any = sessionStorage?.getItem("token");
const decoded: any = token ? jwtDecode(token) : null;

// Utility function to get port based on engine type
const getPortByEngineType = (engineType: ValidEngineTypes): string => {
  switch (engineType) {
    case 'pyspark':
      return SPARK_PORT;
    case 'pandas':
      return PANDAS_PORT;
    case 'pyflink':
      return FLINK_PORT;
    default:
      return SPARK_PORT; // Default fallback
  }
};

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
  pipelineType: string | null;
  aiSuggestion:any;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: string | null;
  isFlow: boolean;
  isRightPanelOpen: boolean;
  selectedEngineType: ValidEngineTypes;
  selectedMode: 'engine' | 'debug' | 'interactive';
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
  aiSuggestion:'',
  isSaving: false,
  hasUnsavedChanges: false,
  lastSaved: null,
  isFlow:false,
  isRightPanelOpen:false,
  selectedEngineType: getAvailableEngineTypes()[0] || 'pyspark',
  selectedMode: 'engine',
  pipelineType: null
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
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/data_source/list/',
      usePrefix: true,
      method: 'GET',
      metadata: {
        errorMessage: 'Failed to fetch data sources'
      },
      params: {
        limit: 1000
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
        baseUrl: CATALOG_REMOTE_API_URL,
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
        baseUrl: CATALOG_REMOTE_API_URL,
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
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/pipeline/',
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
      baseUrl: CATALOG_REMOTE_API_URL,
      url: '/pipeline/list/',
      usePrefix: true,
      method: 'GET',
      params:{order_desc:true},
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
        baseUrl: CATALOG_REMOTE_API_URL,
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
        baseUrl: CATALOG_REMOTE_API_URL,
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
    console.log(params)
    try {
      const state = thunkAPI.getState() as any;
      const engineType = state.buildPipeline.selectedEngineType;
      const port = getPortByEngineType(engineType);
      
      const response = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/pipeline/debug/get_transformation_count`,
        usePrefix: true,
        method: 'GET',
        params: {
          pipeline_name: params.params,
          host: params.host,
          port: port,
          use_secure: USE_SECURE || 'false'
        }
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
        baseUrl:CATALOG_REMOTE_API_URL,
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


export const startPipeLine = createAsyncThunk(
  'build-pipline/startPipeLine',
  async (data: {
    pipeline_name: string;
    pipeline_json: any;
    mode: string;
    checkpoints: string[];
  }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as any;
      const engineType = state.buildPipeline.selectedEngineType;
      const port = getPortByEngineType(engineType);
      
      let checkpoints=await data.checkpoints.map(item => `checkpoints=${item}`).join('&');
      console.log(checkpoints,"checkpoints")
      // Create params in the correct order and format
      const params = new URLSearchParams();
      params.append('pipeline_name', data.pipeline_name);
      params.append('pipeline_json', JSON.stringify(data.pipeline_json));
      params.append('mode', data.mode);
      // Add checkpoints as separate parameters without array notation
      // data.checkpoints.forEach(checkpoint => {
      //   params.append('checkpoints', checkpoint);
      // });
      params.append('checkpoints', checkpoints);
      params.append('host', 'host.docker.internal');
      params.append('port', port);
      console.log(Object.fromEntries(params),"Object.fromEntries(params)")
      const response = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/api/v1/pipeline/debug/start_pipeline`,
        // usePrefix: true,
        method: 'POST',
        params: Object.fromEntries(params)
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
      console.log(params)
      const state = thunkAPI.getState() as any;
      const engineType = state.buildPipeline.selectedEngineType;
      const port = getPortByEngineType(engineType);
      const host = params.host || 'host.docker.internal';
      
      const response = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/api/v1/pipeline/debug/stop_pipeline?pipeline_name=${encodeURIComponent(params.params)}&host=${host}&port=${port}&use_secure=${USE_SECURE || 'false'}`,
        // usePrefix: true,
        method: 'POST',
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
      // alert(JSON.stringify(params))
      // if (!params.id) {
      //   return thunkAPI.rejectWithValue('Pipeline ID is required');
      // }

      const response = await apiService.get({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/pipeline/${params.id}`,
        usePrefix: true,
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchTransformationOutput = createAsyncThunk<
  TransformationMetrics,
  { pipelineName: string; transformationName: string; isFlow?: boolean,host?:string }
>(
  'pipeline/fetchTransformationOutput',
  async ({ pipelineName, transformationName, isFlow = false,host }) => {
    // Determine the correct endpoint based on whether we're in flow or pipeline context
    const url = isFlow 
      ? `/api/v1/flow/debug/get_transformation_output` 
      : `/api/v1/pipeline/debug/get_transformation_output`;
      
    const response = await apiService.get<TransformationMetrics>({
      baseUrl:CATALOG_REMOTE_API_URL,
      url,
      // usePrefix: true,
      method: 'GET',
      params: {
        [isFlow ? 'flow_name' : 'pipeline_name']: pipelineName,
        transformation_name: transformationName,
        use_secure: USE_SECURE || 'false',
        host:host||'host.docker.internal',
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
      baseUrl: CATALOG_REMOTE_API_URL,
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
      baseUrl: CATALOG_REMOTE_API_URL,
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
  async (params: { pipeline_name: string, host?: string }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as any;
      const engineType = state.buildPipeline.selectedEngineType;
      const port = getPortByEngineType(engineType);
      const host = params.host ;
      
      const response = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: `/pipeline/run-next-checkpoint?pipeline_name=${encodeURIComponent(params.pipeline_name)}&host=${host}&port=${port}&use_secure=${USE_SECURE || 'false'}`,
        usePrefix: true,
        method: 'POST'
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
  async ({ params,operation_type,thread_id }: { params:any,operation_type:string,thread_id:string }, thunkAPI) => {
    try {
      const response = await apiService.post({
        baseUrl:AGENT_REMOTE_URL,
        url: '/generic/',
        usePrefix: true,
        method: 'POST',
        data: {
          operation_type: operation_type,
          params: params,
          thread_id: thread_id
        }
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// New Async thunk for creating pipeline schema
export const createPipelineSchema = createAsyncThunk(
  'build-pipline/createPipelineSchema',
  async ({ pipelineId, request }: { pipelineId: string; request: string }, thunkAPI) => {
    try {
      const response = await apiService.post({
        baseUrl:AGENT_REMOTE_URL,
        url: '/pipeline_schema/create_pipeline',
        usePrefix: true,
        method: 'POST',
        data: {
          pipeline_id: pipelineId,
          request: request,
          thread_id: `${pipelineId}_001`
        }
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// New Async thunk for creating static pipeline schema
export const createStaticPipelineSchema = createAsyncThunk(
  'build-pipline/createStaticPipelineSchema',
  async ({ pipelineId, request }: { pipelineId: string; request: string }, thunkAPI) => {
    try {
      const response = await apiService.post({
        baseUrl:AGENT_REMOTE_URL,
        url: '/pipeline_schema/static/pipeline_schema',
        usePrefix: true,
        method: 'POST',
        data: {
          pipeline_id: pipelineId,
          request: request,
          thread_id: `${pipelineId}_001`
        }
      });
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// New Async thunk for recommending data sources
export const recommendDataSources = createAsyncThunk(
  'build-pipline/recommendDataSources',
  async (request: string, thunkAPI) => {
    try {
      const response = await apiService.post({
        baseUrl:AGENT_REMOTE_URL,
        url: '/pipeline_schema/recommend_data_sources',
        usePrefix: true,
        method: 'POST',
        data: {
          request: request
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
      state.pipelineDtl = action.payload;
    },
    setPipeLineType: (state, action: PayloadAction<string | null>) => {
      state.pipelineType = action.payload;
    },
    setIsFlow: (state, action: PayloadAction<any>) => {
      state.isFlow = action.payload;
    },
    setIsRightPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isRightPanelOpen = action.payload;
    },
    setBuildPipeLineNodes: (state, action: PayloadAction<any[]>) => {
      state.nodesList = action.payload;
    },
    setIsRun: (state, action: PayloadAction<boolean>) => {
      state.isPipelineRunning = action.payload;
    },
    setSavedSlice: (state) => {
      state.isSaving = false;
      state.hasUnsavedChanges = false;
      state.lastSaved = new Date().toISOString();
  },
  setUnsavedChangesSlice: (state) => {
    state.hasUnsavedChanges = true;
    state.isSaving = false;
    state.lastSaved = null;
  },
  setSelectedEngineType: (state, action: PayloadAction<ValidEngineTypes>) => {
    state.selectedEngineType = action.payload;
  },
  setSelectedMode: (state, action: PayloadAction<'engine' | 'debug' | 'interactive'>) => {
    state.selectedMode = action.payload;
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
        (state, action: PayloadAction<unknown>) => {
          state.loading = false;
          // Handle the response as needed
        }
      )
      .addCase(
        startPipeLine.rejected,
        (state, action: PayloadAction<unknown, string, any, SerializedError>) => {
          state.loading = false;
          state.error = action.error?.message || 'Pipeline start failed';
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

      .addCase(createPipelineSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPipelineSchema.fulfilled, (state, action) => {
        state.loading = false;
        // You can store the response in state if needed
      })
      .addCase(createPipelineSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create pipeline schema';
      })

      .addCase(createStaticPipelineSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaticPipelineSchema.fulfilled, (state, action) => {
        state.loading = false;
        // You can store the response in state if needed
      })
      .addCase(createStaticPipelineSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create static pipeline schema';
      })

      .addCase(recommendDataSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recommendDataSources.fulfilled, (state, action) => {
        state.loading = false;
        // You can store the response in state if needed
        // For example: state.recommendedSources = action.payload;
      })
      .addCase(recommendDataSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get data source recommendations';
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
  setPipeLineType,
  setIsFlow,
  setBuildPipeLineNodes,
  setIsDebug,
  setIsRun,
  setSavedSlice,
  setUnsavedChangesSlice,
  setIsRightPanelOpen,
  setSelectedEngineType,
  setSelectedMode
} = buildPipeLineSlice.actions;