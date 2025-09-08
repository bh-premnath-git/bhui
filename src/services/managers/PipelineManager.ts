import { BaseManager, ManagerContext } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class PipelineManager implements BaseManager {
  mode: ChatMode = 'create-pipeline';

  canHandle(mode: ChatMode): boolean {
    return mode === 'create-pipeline';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('pipeline-renderer'));
  }

  generateResponse(userMessage: string): string {
    return `I'll help you create a data pipeline. Based on your request "${userMessage}", the pipeline configuration is now available in the pipeline editor on the right.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return true; // Always show 2-column for pipeline mode (first and subsequent queries)
  }

  getRenderer(): RendererId {
    return 'pipeline-renderer';
  }
}