import { Dispatch } from '@reduxjs/toolkit';
import { CONNECTION_WORKFLOW, PROJECT_WORKFLOW, ENVIRONMENT_WORKFLOW, DATA_CATALOG_WORKFLOW, PIPELINE_WORKFLOW, type WorkflowConfig, type WorkflowStep } from '@/data/chatResponses';
import { 
  addMessage, 
  setTyping, 
  setLoading, 
  setRightComponent,
  RightComponent 
} from '@/store/slices/chat/chatSlice';

export class ChatService {
  private dispatch: Dispatch;
  private currentWorkflow: WorkflowConfig | null = null;
  private currentStepId: string | null = null;

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

    this.dispatch(addMessage({
      content: actionTitles[actionId] || actionId,
      isUser: true
    }));

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

  async handleUserChoice(choice: string): Promise<void> {
    if (!this.currentWorkflow || !this.currentStepId) {
      console.warn('No active workflow or step');
      return;
    }

    const currentStep = this.currentWorkflow.steps.find(s => s.id === this.currentStepId);
    if (!currentStep || !currentStep.options) {
      console.warn('Current step has no options');
      return;
    }

    const selectedOption = currentStep.options.find(opt => opt.label === choice);
    if (!selectedOption) {
      console.warn(`Option not found: ${choice}`);
      return;
    }

    // Add user's choice as a message
    this.dispatch(addMessage({
      content: choice,
      isUser: true
    }));

    // Store pipeline JSON if provided (for sample pipelines)
    if (selectedOption.pipelineJson) {
      // Store the pipeline JSON in localStorage for later use
      localStorage.setItem('selectedPipelineJson', JSON.stringify(selectedOption.pipelineJson));
    }

    // Execute the next step
    await this.executeStep(selectedOption.next);
  }

  async handleCardClick(stepId: string): Promise<void> {
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
      this.dispatch(addMessage({
        content: step.message,
        isUser: false,
        options: step.options?.map(opt => opt.label)
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
            props: step.uiComponent.props,
            stepId: stepId
          }
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
          'DataPipelineCanvas': 'pipeline-canvas'
        };
        
        const componentId = componentIdMap[step.uiComponent.props.component || ''] || 'connection-form';
        
        // Open right aside component (render PipelineCanvasWrapper for 'pipeline-canvas')
        const rightComponent: RightComponent = {
          componentType: 'RightAsideComponent',
          componentId: componentId,
          title: step.uiComponent.props.title || 'Configuration Panel',
          isVisible: true
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
}

// Singleton instance
let chatServiceInstance: ChatService | null = null;

export const getChatService = (dispatch: Dispatch): ChatService => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(dispatch);
  }
  return chatServiceInstance;
};