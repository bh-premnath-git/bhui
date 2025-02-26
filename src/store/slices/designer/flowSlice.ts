import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flow } from '@/types/designer/flow';
import { Environment } from '@/types/admin/environment';
import { Project } from '@/types/admin/project';
import { CATALOG_API_PORT } from '@/config/platformenv';
import { apiService } from '@/lib/api/api-service';

interface FlowState {
    flows: Flow[];
    selectedFlow: Flow | null;
    environment: Environment | null;
    dagEunID: Record<string, any> | null;
    dagParserTime: string | null;
    projects: Project[];
    environments: Environment[];
    selectedProject: Project | null;
    selectedEnvironment: Environment | null;
    loading: boolean;
    error: string | null;
    dagRunId: { dag_run_id: string; dag_id: string } | null;
}

const initialState: FlowState = {
    flows: [],
    selectedFlow: null,
    environment: null,
    dagEunID: null,
    dagParserTime: null,
    projects: [],
    environments: [],
    selectedProject: null,
    selectedEnvironment: null,
    loading: false,
    error: null,
    dagRunId: null,
};

export const fetchProjects = createAsyncThunk(
    "flows/fetchProjects",
    async () => {
        const response = await apiService.get<Project[]>({
            portNumber: CATALOG_API_PORT,
            url: '/bh_project/list/',
            usePrefix: true,
            method: 'GET',
            metadata: {
                errorMessage: 'Failed to fetch projects'
            }
        });
        return response;
    }
);

export const fetchEnvironments = createAsyncThunk(
    "flows/fetchEnvironments",
    async () => {
        const response = await apiService.get<Environment[]>({
            portNumber: CATALOG_API_PORT,
            url: '/environment/environment/list/',
            usePrefix: true,
            method: 'GET',
            metadata: {
                errorMessage: 'Failed to fetch environments'
            }
        });
        return response;
    }
);

export const patchFlowOperation = createAsyncThunk(
    "flows/patchFlowOperation",
    async (data: { flowId: number, data: Partial<Flow> }) => {
        const response = await apiService.patch<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/${data.flowId}/`,
            data: data.data,
            usePrefix: true,
            method: 'PATCH',
            metadata: {
                errorMessage: 'Failed to patch flow operation'
            }
        });
        return response;
    }
);

export const patchCronDeployment = createAsyncThunk(
    "flows/patchCronDeployment",
    async (data: { flow_deployment_id: number, cron_expression: { cron_expression: string } }) => {
        const response = await apiService.patch<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/deployment/${data.flow_deployment_id}/cron/`,
            data: data.cron_expression,
            usePrefix: true,
            method: 'PATCH',
            metadata: {
                errorMessage: 'Failed to update cron schedule'
            }
        });
        return response;
    }
);

export const fetchDagParserTime = createAsyncThunk(
    "flows/fetchDagParserTime",
    async (query: { dag_id: string; airflow_env_name: string; bh_env_name: string }) => {
        const response = await apiService.get<{ last_parsed_time: string }>({
            portNumber: CATALOG_API_PORT,
            url: '/flow/dag/parser/time/',
            params: query,
            usePrefix: true,
            method: 'GET',
            metadata: {
                errorMessage: 'Failed to fetch DAG parser time'
            }
        });
        return response.last_parsed_time;
    }
);

export const commitFlowVersion = createAsyncThunk(
    "flows/commitFlowVersion",
    async (data: { flow_deployment_id: number; comment: string }) => {
        const response = await apiService.post<Flow>({
            portNumber: CATALOG_API_PORT,
            url: '/flow/flow-version/',
            data,
            usePrefix: true,
            method: 'POST',
            metadata: {
                errorMessage: 'Failed to commit flow version'
            }
        });
        return response;
    }
);

export const updateFlowDefinition = createAsyncThunk(
    "flows/updateFlowDefinition",
    async (data: { 
        flow_id: string; 
        flow_json: {
            flow_deployment_id: number;
            flow_id: string;
            flow_json: { flowJson: any[]; flowStructure: any };
        }
    }) => {
        const response = await apiService.post<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/${data.flow_id}/definition/`,
            data: data.flow_json,
            usePrefix: true,
            method: 'POST',
            metadata: {
                errorMessage: 'Failed to update flow definition'
            }
        });
        return response;
    }
);

export const triggerDagDeployment = createAsyncThunk(
    "flows/triggerDagDeployment",
    async (data: { dag_id: string; airflow_env_name: string; bh_env_name: string }) => {
        const response = await apiService.post<{ dag_run_id: string }>({
            portNumber: CATALOG_API_PORT,
            url: '/bh_airflow/trigger_dag/',
            data,
            usePrefix: true,
            method: 'POST',
            metadata: {
                errorMessage: 'Failed to trigger DAG deployment'
            }
        });
        return response;
    }
);

const flowSlice = createSlice({
    name: 'flow',
    initialState,
    reducers: {
        setFlows: (state, action: PayloadAction<Flow[]>) => {
            state.flows = action.payload;
        },
        setSelectedFlow: (state, action: PayloadAction<Flow | null>) => {
            state.selectedFlow = action.payload;
        },
        setSelectedProject: (state, action: PayloadAction<number>) => {
            state.selectedProject = state.projects.find(p => p.bh_project_id === action.payload) || null;
        },
        setSelectedEnv: (state, action: PayloadAction<number>) => {
            state.selectedEnvironment = state.environments.find(e => e.bh_env_id === action.payload) || null;
            state.environment = state.environments.find(e => e.bh_env_id === action.payload) || null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setDagRunId: (state, action: PayloadAction<{ dag_run_id: string; dag_id: string }>) => {
            state.dagRunId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch projects';
            })
            .addCase(fetchEnvironments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnvironments.fulfilled, (state, action) => {
                state.loading = false;
                state.environments = action.payload;
                
            })
            .addCase(fetchEnvironments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch environments';
            })
            .addCase(patchFlowOperation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(patchFlowOperation.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFlow = {...state.selectedFlow, ...action.payload};
            })
            .addCase(patchFlowOperation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update flow';
            })
            .addCase(patchCronDeployment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(patchCronDeployment.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFlow = {...state.selectedFlow, ...action.payload};
            })
            .addCase(patchCronDeployment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update cron schedule';
            })
            .addCase(fetchDagParserTime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDagParserTime.fulfilled, (state, action) => {
                state.loading = false;
                state.dagParserTime = action.payload;
            })
            .addCase(fetchDagParserTime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch DAG parser time';
            })
            .addCase(commitFlowVersion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(commitFlowVersion.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFlow = {...state.selectedFlow, ...action.payload};
            })
            .addCase(commitFlowVersion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to commit flow version';
            })
            .addCase(updateFlowDefinition.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFlowDefinition.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFlow = {...state.selectedFlow, ...action.payload};
            })
            .addCase(updateFlowDefinition.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update flow definition';
            })
            .addCase(triggerDagDeployment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(triggerDagDeployment.fulfilled, (state, action) => {
                state.loading = false;
                state.dagRunId = {
                    dag_run_id: action.payload.dag_run_id,
                    dag_id: state.selectedFlow?.flow_name || ''
                };
            })
            .addCase(triggerDagDeployment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to trigger DAG deployment';
            });
    },
});

export const { setFlows, setSelectedFlow, setSelectedProject, setSelectedEnv, setLoading, setError, setDagRunId } = flowSlice.actions;
export default flowSlice.reducer;