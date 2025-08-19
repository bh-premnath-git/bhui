import { Dispatch } from '@reduxjs/toolkit';
import { CONNECTION_WORKFLOW, type WorkflowConfig, type WorkflowStep } from '@/data/chatResponses';
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
      'check-job-statistics': 'Check Job Statistics'
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

  private async executeStep(stepId: string): Promise<void> {
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
        // Open right aside component
        const rightComponent: RightComponent = {
          componentType: 'RightAsideComponent',
          componentId: 'connection-form',
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