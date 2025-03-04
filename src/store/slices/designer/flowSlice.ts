import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Flow, FlowAgentConversationResponse } from '@/types/designer/flow';
import { Environment } from '@/types/admin/environment';
import { Project } from '@/types/admin/project';
import { AGENT_PORT, CATALOG_API_PORT } from '@/config/platformenv';
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
    dagRunId: { dag_run_id: string; dag_id: string; bh_env_name: string } | null;
    flowAgentConversation: FlowAgentConversationResponse | null;
    formDefinition: Record<string, string[]> | null;
    formValues: Record<string, Record<string, string>>;
    dependencies: Record<string, string[]>; // Task dependencies tracking
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
    flowAgentConversation: null,
    formDefinition: null,
    formValues: {},
    dependencies: {}, // Initialize empty dependencies
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

export const updateFlowConfiguration = createAsyncThunk(
    "flows/updateFlowConfiguration",
    async (data: { flow_config_id: number, flow_config: { flow_config: any[] } }) => {
        const response = await apiService.put<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/flow-config/${data.flow_config_id}/`,
            data: data.flow_config,
            usePrefix: true,
            method: 'PUT',
            metadata: {
                errorMessage: 'Failed to update flow configuration'
            }
        });
        return response;
    }
);

export const patchCronDeployment = createAsyncThunk(
    "flows/patchCronDeployment",
    async (data: { flow_deployment_id: number, cron_expression: { cron_expression: { cron: string } } }) => {
        const response = await apiService.patch<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/flow-deployment/${data.flow_deployment_id}`,
            data: data.cron_expression,
            usePrefix: true,
            method: 'PATCH',
            metadata: {
                errorMessage: 'Failed to update cron expression'
            }
        });
        return response;
    }
);

export const fetchDagParserTime = createAsyncThunk(
    "flows/fetchDagParserTime",
    async (query: { dag_id: string; airflow_env_name: string; bh_env_name: string }) => {
        const response = await apiService.get<string>({
            portNumber: CATALOG_API_PORT,
            url: '/bh_airflow/dag_parse_time/',
            params: query,
            usePrefix: true,
            method: 'GET',
            metadata: {
                errorMessage: 'Failed to fetch DAG parser time'
            }
        });
        return response;
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
        flow_json: Record<string, any>
    }) => {
        const response = await apiService.patch<Flow>({
            portNumber: CATALOG_API_PORT,
            url: `/flow/flow-definition/update-by-flow-id/${data.flow_id}`,
            data: data.flow_json,
            usePrefix: true,
            method: 'PATCH',
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
            query: `dag_id=${data.dag_id}&airflow_env_name=${data.airflow_env_name}&bh_env_name=${data.bh_env_name}`,
            usePrefix: true,
            method: 'POST',
            metadata: {
                errorMessage: 'Failed to trigger DAG deployment'
            }
        });
        return response;
    }
);

export const createFlowAgentConversationEntry = createAsyncThunk(
    "flows/createFlowAgentConversationEntry",
    async (data: { flow_id: string; request: string; thread_id: string }) => {
        const response = await apiService.post<FlowAgentConversationResponse>({
            portNumber: AGENT_PORT,
            url: '/flow_agent/create_flow/',
            data,
            usePrefix: true,
            method: 'POST',
            metadata: {
                errorMessage: 'Failed to create flow agent entry'
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
        setDagRunId: (state, action: PayloadAction<{ airflow_env_name: string; dag_run_id: string; dag_id: string; bh_env_name: string }>) => {
            state.dagRunId = action.payload;
            state.dagEunID = action.payload;
        },
        clearFlowAgentConversation: (state) => {
            state.flowAgentConversation = null;
        },
        setFormDefinition: (state, action: PayloadAction<Record<string, string[]> | null>) => {
            state.formDefinition = action.payload;
        },
        setFormValues: (state, action: PayloadAction<Record<string, Record<string, string>>>) => {
            state.formValues = action.payload;
        },
        updateFormValues: (state, action: PayloadAction<{ operator: string; field: string; value: string }>) => {
            const { operator, field, value } = action.payload;
            if (!state.formValues[operator]) {
                state.formValues[operator] = {};
            }
            state.formValues[operator][field] = value;
        },
        clearFormStates: (state) => {
            state.formDefinition = null;
            state.formValues = {};
        },
        setTaskDependencies: (state, action: PayloadAction<Record<string, string[]>>) => {
            state.dependencies = action.payload;
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
                state.dagParserTime = action.payload as string;
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
            .addCase(updateFlowConfiguration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFlowConfiguration.fulfilled, (state, action) => {
                state.loading = false;
                console.log('Update Flow Configuration - Action:', action);
                console.log('Update Flow Configuration - Current selectedFlow:', state.selectedFlow);
                
                if (state.selectedFlow && state.selectedFlow.flow_config) {
                    // Update the flow_config in the selectedFlow
                    state.selectedFlow = {
                        ...state.selectedFlow,
                        flow_config: state.selectedFlow.flow_config.map(config => 
                            config.flow_config_id === action.meta.arg.flow_config_id 
                                ? { 
                                    ...config, 
                                    // Use the actual API response if available, otherwise use the sent data
                                    flow_config: action.payload?.flow_config?.[0]?.flow_config || 
                                                action.meta.arg.flow_config.flow_config 
                                  }
                                : config
                        )
                    };
                    
                    console.log('Update Flow Configuration - Updated selectedFlow:', state.selectedFlow);
                }
            })
            .addCase(updateFlowConfiguration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update flow configuration';
            })
            .addCase(triggerDagDeployment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(triggerDagDeployment.fulfilled, (state, action) => {
                state.loading = false;
                state.dagRunId = {
                    dag_run_id: action.payload.dag_run_id,
                    dag_id: state.selectedFlow?.flow_name || '',
                    bh_env_name: state.selectedEnvironment?.bh_env_name || ''
                };
                // Also update dagEunID for backward compatibility
                state.dagEunID = {
                    dag_run_id: action.payload.dag_run_id,
                    dag_id: state.selectedFlow?.flow_name || '',
                    bh_env_name: state.selectedEnvironment?.bh_env_name || ''
                };
            })
            .addCase(triggerDagDeployment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to trigger DAG deployment';
            })
            .addCase(createFlowAgentConversationEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFlowAgentConversationEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.flowAgentConversation = action.payload;
                
                // Automatically update form definition when conversation is fulfilled
                if (action.payload.status === 'missing' && action.payload.flow_definition && 
                    typeof action.payload.flow_definition === 'object') {
                    state.formDefinition = action.payload.flow_definition as Record<string, string[]>;
                } else if (action.payload.status === 'success' && 
                           typeof action.payload.flow_definition === 'string') {
                    try {
                        // Clean the JSON string by removing markdown code block markers
                        const cleanJsonString = action.payload.flow_definition.replace(/```json\n|\n```/g, '');
                        const parsedJson = JSON.parse(cleanJsonString);
                        if (parsedJson && parsedJson.tasks && Array.isArray(parsedJson.tasks)) {
                            const formDef: Record<string, string[]> = {};
                            const formValues: Record<string, Record<string, string>> = {};

                            parsedJson.tasks.forEach((task: any) => {
                                if (task.type && typeof task.type === 'string') {
                                    const fields: string[] = [];
                                    const values: Record<string, string> = {};
                                    Object.keys(task).forEach(key => {
                                        if (!['type', 'module_name', 'task_id', 'depends_on'].includes(key)) {
                                            fields.push(key);
                                            if (task[key] !== undefined) {
                                                if (Array.isArray(task[key])) {
                                                    values[key] = task[key].join(', ');
                                                } else {
                                                    values[key] = String(task[key]);
                                                }
                                            }
                                        }
                                    });

                                    if (fields.length > 0) {
                                        formDef[task.type] = fields;
                                        formValues[task.type] = values;
                                    }
                                }
                            });

                            if (Object.keys(formDef).length > 0) {
                                state.formDefinition = formDef;
                                state.formValues = formValues;
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing JSON response:', error);
                    }
                }
            })
            .addCase(createFlowAgentConversationEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create flow agent conversation entry';
            });
    },
});

export const { 
    setFlows, 
    setSelectedFlow, 
    setSelectedProject, 
    setSelectedEnv, 
    setLoading, 
    setError, 
    setDagRunId, 
    clearFlowAgentConversation,
    setFormDefinition,
    setFormValues,
    updateFormValues,
    clearFormStates,
    setTaskDependencies
} = flowSlice.actions;
export default flowSlice.reducer;