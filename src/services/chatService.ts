import { Dispatch } from '@reduxjs/toolkit';
import { CONNECTION_WORKFLOW, PROJECT_WORKFLOW, ENVIRONMENT_WORKFLOW, DATA_CATALOG_WORKFLOW, PIPELINE_WORKFLOW, JOB_STATISTICS_WORKFLOW, type WorkflowConfig, type WorkflowStep } from '@/data/chatResponses';
import { 
  addMessage, 
  setTyping, 
  setLoading, 
  setRightComponent,
  setContext,
  RightComponent 
} from '@/store/slices/chat/chatSlice';
import { apiService } from '@/lib/api/api-service';
import { CATALOG_REMOTE_API_URL } from '@/config/platformenv';

export class ChatService {
  private dispatch: Dispatch;
  private currentWorkflow: WorkflowConfig | null = null;
  private currentStepId: string | null = null;
  private contextData: Record<string, any> = {};

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  async processAction(actionId: string): Promise<void> {
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
   
    // Store the query and connection for later use when card is clicked
    this.contextData['exploreQuery'] = query;
    this.contextData['exploreConnection'] = connection;
    this.contextData['threadId'] = threadId;

    // Show a brief typing indicator
    this.dispatch(setTyping(true));
    await this.delay(600);
    this.dispatch(setTyping(false))

    // Add a card component that user can click to open the analysis panel
    this.dispatch(addMessage({
      content: `I'll help you explore: "${query}" on ${connection?.connection_config_name || 'selected connection'}`,
      isUser: false,
      uiComponent: {
        type: 'Card',
        props: {
          title: 'Data Analysis Ready',
          description: `Click to open the analysis panel for: "${query}" on ${connection?.connection_config_name || 'selected connection'}`
        },
        stepId: 'explore-data-card'
      } as any
    }));
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
      await this.executeStep(selectedOption.next);
      return;
    }

    // Handle dynamic options path (when options rendered from API response)
    if ((currentStep as any).dynamicOptions && currentStep.nextOnSelect) {
      await this.executeStep(currentStep.nextOnSelect);
      return;
    }

    console.warn('No options handler for current step');
  }

  async handleCardClick(stepId: string): Promise<void> {
    // Handle special case for explore-data-card
    if (stepId === 'explore-data-card') {
      const query = this.contextData['exploreQuery'];
      const connection = this.contextData['exploreConnection'];
      if (query) {
        await this.handleExploreCardClick(query, connection);
      }
      return;
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

    // Echo user's input as a message
    this.dispatch(addMessage({ content: value, isUser: true }));

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
            endpoint: string;
            isResponseFormat: boolean;
            displayName: string;
            subName?: string | null;
          };

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
          title: step.uiComponent.props.title || 'Configuration Panel',
          isVisible: true,
          extra: (step.uiComponent as any)?.props?.extra
        };
        this.dispatch(setRightComponent(rightComponent));
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  async handleExploreCardClick(query: string, connection?: { id: number | string; connection_config_name: string } | null): Promise<void> {
    // Get threadId from stored context data
    const threadId = this.contextData['threadId'];
    
    // Use full query as title - RightAsideComponent will handle dynamic truncation
    const title = query;
    
    // Open a right-aside requirement form (or any component you prefer) with the query
    const rightComponent: RightComponent = {
      componentType: 'RightAsideComponent',
      componentId: 'explore-data',
      title: title,
      isVisible: true,
      extra: { query, connection, threadId },
    };
    this.dispatch(setRightComponent(rightComponent));

    // Optional: also drop a short assistant message in the chat
    this.dispatch(addMessage({
      content: `Opening data exploration panel for: "${query}" on ${connection?.connection_config_name || 'selected connection'}`,
      isUser: false,
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