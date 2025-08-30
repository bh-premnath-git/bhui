import { Dispatch } from '@reduxjs/toolkit';
import { CONNECTION_WORKFLOW, PROJECT_WORKFLOW, ENVIRONMENT_WORKFLOW, DATA_CATALOG_WORKFLOW, PIPELINE_WORKFLOW, JOB_STATISTICS_WORKFLOW, type WorkflowConfig, type WorkflowStep } from '@/data/chatResponses';
import { 
  addMessage, 
  setTyping, 
  setLoading, 
  setRightComponent,
  setCurrentInputStep,
  RightComponent 
} from '@/store/slices/chat/chatSlice';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL, AGENT_REMOTE_URL } from '@/config/platformenv';
import {  setBuildPipeLineDtl, setPipeLineType, setSelectedEngineType } from '@/store/slices/designer/buildPipeLine/BuildPipeLineSlice';
import { setSelectedPipeline } from '@/store/slices/designer/pipelineSlice';

export class ChatService {
  private dispatch: Dispatch;
  private currentWorkflow: WorkflowConfig | null = null;
  private currentStepId: string | null = null;
  private contextData: Record<string, any> = {};

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  async processAction(actionId: string): Promise<void> {
    // Clear any existing workflow state
    this.currentWorkflow = null;
    this.currentStepId = null;
    this.contextData = {};
    this.dispatch(setCurrentInputStep(null));

    // Add user message first
    const actionTitles: Record<string, string> = {
      'add-users-roles': 'Add Users or roles',
      'add-connections': 'Add new Connections',
      'onboard-dataset': 'Onboard new dataset',
      'create-pipeline': 'Create pipeline',
      'explore-data': 'Explore Data',
      'check-job-statistics': 'Check Job Statistics',
      'add-project': 'Add Project',
      'add-environment': 'Add Environment'
    };

    if (actionId !== 'explore-data') {
      this.dispatch(addMessage({
        content: actionTitles[actionId] || actionId,
        isUser: true
      }));
    }
    // Handle specific actions
    if (actionId === 'add-connections') {
      // Start the connection workflow
      this.currentWorkflow = CONNECTION_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'add-project') {
      // Start the project workflow
      this.currentWorkflow = PROJECT_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'add-environment') {
      // Start the environment workflow
      this.currentWorkflow = ENVIRONMENT_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'onboard-dataset') {
      // Start the data catalog workflow
      this.currentWorkflow = DATA_CATALOG_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'create-pipeline') {
      // Start the pipeline workflow
      this.currentWorkflow = PIPELINE_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'check-job-statistics') {
      // Start the job statistics workflow
      this.currentWorkflow = JOB_STATISTICS_WORKFLOW;
      await this.executeStep('start');
    } else if (actionId === 'explore-data') {
      // Do nothing here. We only set context and wait for the user's next message.
      return;
    } else {
      // For other actions, show a placeholder message
      this.dispatch(setTyping(true));
      await this.delay(800);
      this.dispatch(setTyping(false));
      
      this.dispatch(addMessage({
        content: `This feature is coming soon! The "${actionTitles[actionId]}" functionality is currently under development.`,
        isUser: false
      }));
    }
  }

  async processExploreQuery(query: string, connection?: { id: number | string; connection_config_name: string } | null, threadId?: string): Promise<void> {
   
    // Show a brief typing indicator
    this.dispatch(setTyping(true));
    await this.delay(600);
    this.dispatch(setTyping(false));

    // Inform the user and immediately open the analysis panel
    this.dispatch(addMessage({
      content: `I'll help you explore: "${query}" on ${connection?.connection_config_name || 'selected connection'}`,
      isUser: false,
    }));

    const rightComponent: RightComponent = {
      componentType: 'RightAsideComponent',
      componentId: 'explore-data',
      title: query,
      isVisible: true,
      extra: { query, connection, threadId },
    };
    this.dispatch(setRightComponent(rightComponent));
  }

  async handleUserChoice(choice: string): Promise<void> {
    if (!this.currentWorkflow || !this.currentStepId) {
      console.warn('No active workflow or step');
      return;
    }

    const currentStep = this.currentWorkflow.steps.find(s => s.id === this.currentStepId);
    if (!currentStep) {
      console.warn('Current step not found');
      return;
    }

    // Add user's choice as a message
    this.dispatch(addMessage({ content: choice, isUser: true }));

    // Persist selected value for later API calls
    if (currentStep.id === 'askPipelineMode') {
      this.contextData['engineType'] = choice?.toLowerCase();
    }
    if (currentStep.id === 'askPipelineKind') {
      this.contextData['pipelineType'] = choice?.toLowerCase().includes('requirement') ? 'requirement' : 'design';
    }

    // Handle static options path
    if (currentStep.options && currentStep.options.length > 0) {
      const selectedOption = currentStep.options.find(opt => opt.label === choice);
      if (!selectedOption) {
        console.warn(`Option not found: ${choice}`);
        return;
      }

      if (selectedOption.pipelineJson) {
        localStorage.setItem('selectedPipelineJson', JSON.stringify(selectedOption.pipelineJson));
      }

      // For create step, execute the step so its API runs
      if (selectedOption.next === 'createPipeline') {
        await this.executeStep('createPipeline');
        return;
      }

      await this.executeStep(selectedOption.next);
      return;
    }

    // Handle dynamic options path (when options rendered from API response)
    if ((currentStep as any).dynamicOptions && currentStep.nextOnSelect) {
      // Capture key selections from dynamic lists
      const dyn: any = (currentStep as any).dynamicOptions;
      const endpoint: string = dyn?.endpoint || '';
      if (endpoint.includes('bh_project/list')) {
        this.contextData['selectedProjectName'] = choice;
        await this.resolveProjectIdByName(choice);
      }

      if (currentStep.nextOnSelect === 'createPipeline') {
        await this.executeStep('createPipeline');
        return;
      }
      await this.executeStep(currentStep.nextOnSelect);
      return;
    }

    console.warn('No options handler for current step');
  }

  async handleCardClick(stepId: string, payload?: any): Promise<void> {
    // Handle special non-workflow cards
    if (stepId === 'viewPipelineSchema') {
      try {
        // Allow selecting a particular pipeline JSON via payload key
        let jsonStr: string | null = null;
        const key = payload?.pipelineJsonKey as string | undefined;
        if (key) {
          jsonStr = localStorage.getItem(key);
        }
        if (!jsonStr) {
          jsonStr = localStorage.getItem('selectedPipelineJson');
        }
        if (jsonStr) {
          // Keep selected for initial canvas load paths
          localStorage.setItem('selectedPipelineJson', jsonStr);
          try {
            const parsed = JSON.parse(jsonStr);
            // Notify any open canvas to update immediately
            window.dispatchEvent(new CustomEvent('chat:set-pipeline-json', { detail: { pipelineJson: parsed } }));
          } catch {}
        }
      } catch {}

      await this.showPipelineSchemaOnRightSide();
      return; // stop workflow handling for non-workflow canvas action
    }
    if (!this.currentWorkflow) {
      console.warn('No active workflow');
      return;
    }

    const step = this.currentWorkflow.steps.find(s => s.id === stepId);
    if (!step || !step.nextOnClick) {
      console.warn('Step has no nextOnClick');
      return;
    }

    await this.executeStep(step.nextOnClick);
  }

  async handleInputSubmit(stepId: string, value: string): Promise<void> {
    if (!this.currentWorkflow) return;
    const step = this.currentWorkflow.steps.find(s => s.id === stepId);
    if (!step) return;

    // Save input in context
    if (step.inputKey) {
      this.contextData[step.inputKey] = value;
    }

    // Echo user's input as a message (truncate long JSON for display)
    let echo = value;
    if (echo.length > 1000) echo = echo.slice(0, 1000) + '...';
    this.dispatch(addMessage({ content: echo, isUser: true }));

    // Intercept pipeline name to store
    if (stepId === 'askPipelineName') {
      this.contextData['pipelineName'] = value;
    }

    // Intercept description submission to call schema endpoint
    if (stepId === 'askPipelineDescription' || stepId === 'promptPipelineDescription') {
      await this.applyPipelineExpectation();
      // Don't continue to next step automatically - let user click the card to view schema
      return;
    }

    // Continue to next step
    if (step.nextOnSubmit) {
      await this.executeStep(step.nextOnSubmit);
    }
  }

  async executeStep(stepId: string): Promise<void> {
    if (!this.currentWorkflow) return;

    const step = this.currentWorkflow.steps.find(s => s.id === stepId);
    if (!step) {
      console.warn(`Step not found: ${stepId}`);
      return;
    }

    this.currentStepId = stepId;

    // Only execute API automatically for the explicit pipeline creation step
    // Avoid triggering any API on non-creation steps (e.g., prompt steps) or other workflows
    if ((step as any).api && step.id === 'createPipeline') {
      try {
        const cfg: any = (step as any).api;
        const payload: any = {
          pipeline_name: this.contextData['pipelineName'] || 'New Pipeline',
          bh_project_id: Number(this.contextData['bh_project_id']),
          notes: '',
          tags: {},
          pipeline_json: {},
          pipeline_type: this.contextData['pipelineType'] || 'design',
          engine_type: this.contextData['engineType'] || 'pyspark'
        };
        if (payload.bh_project_id) {
          const resp: any = await apiService.post({
            baseUrl: cfg.baseUrl,
            url: cfg.url,
            method: cfg.method || 'POST',
            usePrefix: cfg.usePrefix ?? false,
            data: payload
          });
          if (resp && (resp.pipeline_id || resp.id)) {
            const id = String(resp.pipeline_id ?? resp.id);
            // Persist for later steps
            this.contextData['pipeline_id'] = id;
            localStorage.setItem('pipeline_id', id);
            (this.dispatch as any)(setBuildPipeLineDtl(resp));
            (this.dispatch as any)(setSelectedPipeline(resp));
            (this.dispatch as any)(setPipeLineType(resp.pipeline_type || payload.pipeline_type));
            (this.dispatch as any)(setSelectedEngineType(resp.engine_type || payload.engine_type));
          }
        } else {
          console.warn('Project not selected; cannot call step.api');
        }
      } catch (e) {
        console.error('Step API call failed', e);
      }
      // Auto-advance when step defines API but no UI to click
      if (step.nextOnClick && !step.uiComponent) {
        await this.executeStep(step.nextOnClick);
        return;
      }
    }

    // Show typing indicator
    this.dispatch(setTyping(true));
    await this.delay(800);
    this.dispatch(setTyping(false));

    // Handle different step types
    if (step.message) {
      // Build options either from static options or dynamic API options
      let options: string[] | undefined = step.options?.map(opt => opt.label);

      if (!options && (step as any).dynamicOptions) {
        try {
          const dyn = (step as any).dynamicOptions as {
            endpoint: string; // supports 'hook:useEngineTypes' or API path
            isResponseFormat: boolean;
            displayName: string;
            subName?: string | null;
          };

          if (dyn.endpoint.startsWith('hook:')) {
            const hookName = dyn.endpoint.slice('hook:'.length);
            if (hookName === 'useEngineTypes') {
              const { pipelineSchema } = await import('@bh-ai/schemas');
              const engineEnums: string[] = pipelineSchema?.properties?.engine_type?.enum || ['pyspark', 'pyflink'];
              const list = engineEnums.map((e) => ({ label: e.charAt(0).toUpperCase() + e.slice(1) }));
              options = list.map((item: any) => String(item[dyn.displayName] ?? '')).filter(Boolean);
            } else if (hookName === 'usePipelineViewModes') {
              // Provide toggle options for pipeline views
              const list = [
                { label: 'Pipeline' },
                { label: 'Table' },
              ];
              options = list.map((item: any) => String(item[dyn.displayName] ?? '')).filter(Boolean);
            } else {
              options = [];
            }
          } else {
            const data = await apiService.get<any>({
              url: `/${dyn.endpoint.replace(/^\//, '')}`,
              baseUrl: CATALOG_REMOTE_API_URL,
              method: 'GET',
              usePrefix: true,
            });

            const list = dyn.isResponseFormat ? (data?.data ?? []) : data;

            const getByPath = (obj: any, path: string | undefined | null): string | undefined => {
              if (!obj || !path) return undefined;
              return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
            };

            options = Array.isArray(list)
              ? list.map((item: any) => {
                  const main = getByPath(item, dyn.displayName) ?? '';
                  const sub = getByPath(item, dyn.subName ?? undefined);
                  return sub ? `${main} (${sub})` : String(main);
                }).filter(Boolean)
              : [];
          }
        } catch (e) {
          console.error('Failed to load dynamic options', e);
          options = [];
        }
      }

      this.dispatch(addMessage({
        content: step.message,
        isUser: false,
        options,
      }));
    }

    if (step.uiComponent) {
      if (step.uiComponent.type === 'Card') {
        // Add card component to chat
        this.dispatch(addMessage({
          content: '',
          isUser: false,
          uiComponent: {
            type: 'Card',
            props: (step.uiComponent as any).props,
            stepId: stepId
          } as any
        }));
      } else if ((step.uiComponent as any).type === 'Input') {
        // Add input component prompt
        this.dispatch(addMessage({
          content: '',
          isUser: false,
          uiComponent: {
            type: 'Input',
            props: (step.uiComponent as any).props,
            stepId: stepId
          } as any
        }));
      } else if ((step.uiComponent as any).type === 'TextArea') {
        // Add textarea prompt
        this.dispatch(addMessage({
          content: '',
          isUser: false,
          uiComponent: {
            type: 'TextArea',
            props: (step.uiComponent as any).props,
            stepId: stepId
          } as any
        }));
      } else if (step.uiComponent.type === 'RightAsideComponent') {
        // Map component names to component IDs
        const componentIdMap: Record<string, string> = {
          'AddConnection': 'connection-form',
          'AddProject': 'project-form',
          'AddEnvironment': 'environment-form',
          'AddTable': 'table-form',
          'AddFile': 'file-form',
          'AddPipeline': 'pipeline-form',
          'DataPipelineCanvas': 'pipeline-canvas',
          'RequirementForm': 'requirement-form'
        };
        
        const componentId = componentIdMap[step.uiComponent.props.component || ''] || 'connection-form';
        
        // Open right aside component (render PipelineCanvasWrapper for 'pipeline-canvas')
        const rightComponent: RightComponent = {
          componentType: 'RightAsideComponent',
          componentId: componentId,
          title: '', // Remove the title
          isVisible: true,
          extra: (step.uiComponent as any)?.props?.extra
        };
        this.dispatch(setRightComponent(rightComponent));
      }
    }

    // Set current input step if this step expects input
    if (step.inputKey && step.nextOnSubmit) {
      this.dispatch(setCurrentInputStep({
        stepId: stepId,
        inputKey: step.inputKey
      }));
    } else {
      // Clear current input step if this step doesn't expect input
      this.dispatch(setCurrentInputStep(null));
    }
  }

  // Show pipeline canvas on the right side panel
  private async showPipelineSchemaOnRightSide(): Promise<void> {
    try {
      const pipelineJson = localStorage.getItem('selectedPipelineJson');
      if (!pipelineJson) {
        this.dispatch(addMessage({
          content: 'No pipeline schema found. Please generate the schema first.',
          isUser: false
        }));
        return;
      }

      // Get pipeline details
      const pipelineName = this.contextData['pipelineName'] || 'Unnamed Pipeline';
      const pipelineType = this.contextData['pipelineType'] || 'design';
      
      // Configure canvas based on pipeline type
      let rightComponent: RightComponent;
      
      if (pipelineType === 'design') {
        // For design pipelines: simple canvas without header icons and no title
        rightComponent = {
          componentType: 'RightAsideComponent',
          componentId: 'pipeline-canvas',
          title: '', // Remove the title
          isVisible: true,
          extra: {
            hideHeader: true,
            // Show icons in design mode too (pipeline + table)
            hideIcons: false,
            pipelineType: 'design',
            pipelineName: pipelineName !== 'Unnamed Pipeline' ? pipelineName : null,
            toggles: [
              {
                id: 'pipeline-canvas',
                title: 'Pipeline',
                componentId: 'pipeline-canvas',
                targetComponent: 'DataPipelineCanvas'
              },
              {
                id: 'data-table-view',
                title: 'Data Table',
                componentId: 'data-table-view',
                targetComponent: 'SampleDataTableView'
              }
            ]
          }
        };
      } else {
        // For other pipeline types: full featured canvas with toggles
        rightComponent = {
          componentType: 'RightAsideComponent',
          componentId: 'pipeline-canvas',
          title: '', // Remove the title
          isVisible: true,
          extra: {
            pipelineType,
            pipelineName,
            toggles: [
              {
                id: 'requirement-form',
                title: 'Requirement',
                componentId: 'requirement-form',
                targetComponent: 'RequirementForm'
              },
              {
                id: 'pipeline-canvas',
                title: 'Pipeline',
                componentId: 'pipeline-canvas',
                targetComponent: 'DataPipelineCanvas'
              }
            ]
          }
        };
      }
      
      this.dispatch(setRightComponent(rightComponent));
      
      // Add confirmation message
      this.dispatch(addMessage({
        content: pipelineType === 'design' 
          ? 'Pipeline designer opened. Start building your pipeline visually.' 
          : 'Pipeline canvas opened. You can now design your pipeline visually.',
        isUser: false
      }));
    } catch (e) {
      console.error('Failed to show pipeline canvas', e);
      this.dispatch(addMessage({
        content: 'Failed to open pipeline canvas. Please try again.',
        isUser: false
      }));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Create pipeline if not created yet
  private async createPipelineIfNeeded(): Promise<void> {
    try {
      // If we already have an ID, skip
      const existingId = localStorage.getItem('pipeline_id');
      if (existingId) return;

      const projectId = this.contextData['bh_project_id'];
      const pipelineName = this.contextData['pipelineName'] || 'New Pipeline';
      const pipelineType = this.contextData['pipelineType'] || 'design';
      const engineType = this.contextData['engineType'] || 'pyspark';

      if (!projectId) {
        console.warn('Project not selected; cannot create pipeline');
        return;
      }

      // Build payload per requirement
      const payload: any = {
        pipeline_name: pipelineName,
        bh_project_id: Number(projectId),
        notes: '',
        tags: {},
        pipeline_json: {},
        pipeline_type: pipelineType,
        engine_type: engineType
      };

      // Call localhost:8011/api/v1/pipeline (no prefix)
      const response: any = await apiService.post({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/api/v1/pipeline/',
        method: 'POST',
        usePrefix: false,
        data: payload
      });

      // Expect response contains pipeline_id
      if (response && (response.pipeline_id || response.id)) {
        const id = String(response.pipeline_id ?? response.id);
        // Persist for later steps
        this.contextData['pipeline_id'] = id;
        localStorage.setItem('pipeline_id', id);
        (this.dispatch as any)(setBuildPipeLineDtl(response));
        (this.dispatch as any)(setSelectedPipeline(response));
        (this.dispatch as any)(setPipeLineType(response.pipeline_type || pipelineType));
        (this.dispatch as any)(setSelectedEngineType(response.engine_type || engineType));
      } else {
        console.warn('Create pipeline response missing pipeline_id');
      }
    } catch (e) {
      console.error('Failed to create pipeline from chat flow', e);
    }
  }

  // Apply pipeline expectation by calling schema endpoint
  private async applyPipelineExpectation(): Promise<void> {
    try {
      const pipelineId = this.contextData['pipeline_id'] || localStorage.getItem('pipeline_id');
      const expectation = this.contextData['pipelineExpectation'];
      if (!pipelineId || !expectation) return;

      // Show loading indication
      this.dispatch(setTyping(true));
      this.dispatch(addMessage({
        content: 'Your pipeline is being built. This may take a moment...',
        isUser: false
      }));

      // Default available columns structure
      const columnsToUse = this.contextData['available_columns'] || { columns: [] };

      // Support JSON pasted by user: if valid JSON, send as-is; else send as user_request
      let data: any = { pipeline_id: pipelineId, user_request: expectation, available_columns: columnsToUse };
      try {
        const parsed = JSON.parse(expectation);
        if (parsed && typeof parsed === 'object') {
          data = { pipeline_id: pipelineId, pipeline_json: parsed, available_columns: columnsToUse };
        }
      } catch { /* treat as plain text */ }

      const response: any = await apiService.post({
        url: '/api/v1/pipeline_schema/pipeline',
        baseUrl: AGENT_REMOTE_URL,
        method: 'POST',
        usePrefix: false,
        data
      });

      // Stop loading indication
      this.dispatch(setTyping(false));

      if (response?.pipeline_json) {
        // Store this specific pipeline JSON under a unique key and as the latest selection
        try {
          const jsonStr = JSON.stringify(response.pipeline_json);
          const storageKey = `pipeline_json_${Date.now()}`;
          localStorage.setItem(storageKey, jsonStr);
          localStorage.setItem('selectedPipelineJson', jsonStr);
          // Remember the last storageKey for this response to attach on the card
          this.contextData['lastPipelineJsonKey'] = storageKey;
        } catch {}

        // Show success message
        this.dispatch(addMessage({
          content: '✅ Pipeline schema generated successfully!',
          isUser: false
        }));

        // Get pipeline details for the card
        const pipelineName = this.contextData['pipelineName'] || 'Unnamed Pipeline';
        const pipelineType = this.contextData['pipelineType'] || 'design';
        const userRequest = this.contextData['pipelineExpectation'] || 'No description provided';
        
        // Truncate user request if too long
        const truncatedRequest = userRequest.length > 100 
          ? userRequest.substring(0, 100) + '...' 
          : userRequest;

        // Show clickable card to open the pipeline canvas; include payload for this version
        this.dispatch(addMessage({
          content: '',
          isUser: false,
          uiComponent: {
            type: 'Card',
            props: {
              title: `${pipelineName} (${pipelineType})`,
              description: `User Request: ${truncatedRequest}\n\nClick to open pipeline canvas for visual design`
            },
            stepId: 'viewPipelineSchema',
            payload: {
              pipelineJsonKey: this.contextData['lastPipelineJsonKey']
            }
          } as any
        }));

        // Ensure the payload key on the last message matches the stored key
        try {
          const lastMsgIndexUpdater = (stateUpdater: (msgs: any[]) => void) => {};
          // Not mutating store directly; instead, add another message with correct payload to avoid complexity
        } catch {}
      } else {
        this.dispatch(addMessage({
          content: 'Pipeline schema generated, but no JSON structure was returned.',
          isUser: false
        }));
      }
    } catch (e) {
      console.error('Failed to apply pipeline expectation', e);
      this.dispatch(setTyping(false));
      this.dispatch(addMessage({
        content: 'Failed to generate pipeline schema. Please try again.',
        isUser: false
      }));
    }
  }

  // Resolve and cache project id by name from catalog
  private async resolveProjectIdByName(projectName: string): Promise<void> {
    try {
      const data: any = await apiService.get<any>({
        baseUrl: CATALOG_REMOTE_API_URL,
        url: '/bh_project/list/',
        method: 'GET',
        usePrefix: true,
        params: { limit: 1000, offset: 0 }
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const match = list.find((p: any) => String(p?.bh_project_name).trim() === projectName.trim());
      if (match?.bh_project_id) {
        this.contextData['bh_project_id'] = match.bh_project_id;
        this.contextData['bh_project_name'] = match.bh_project_name;
      }
    } catch (e) {
      console.warn('Failed to resolve project id by name', e);
    }
  }

  // Method to close right component
  closeRightComponent(): void {
    this.dispatch(setRightComponent(null));
  }

  // Method to simulate AI thinking/processing
  async simulateThinking(message: string = "Let me process that for you..."): Promise<void> {
    this.dispatch(setLoading(true));
    await this.delay(1500);
    this.dispatch(setLoading(false));
    
    this.dispatch(addMessage({
      content: message,
      isUser: false
    }));
  }

}

// Singleton instance
let chatServiceInstance: ChatService | null = null;

export const getChatService = (dispatch: Dispatch): ChatService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(dispatch);
  }
  return chatServiceInstance;
};
