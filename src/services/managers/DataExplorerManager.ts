import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class DataExplorerManager implements BaseManager {
  mode: ChatMode = 'explore-data';

  canHandle(mode: ChatMode): boolean {
    return mode === 'explore-data';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('data-explorer-renderer'));
  }

  generateResponse(userMessage: string): string {
    return `I've analyzed your query "${userMessage}" and the interactive visualization is now displayed in the data explorer.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    // Always show 2-column if connection is selected (for both first and subsequent queries)
    return data.selectedConnection !== undefined;
  }

  getRenderer(): RendererId {
    return 'data-explorer-renderer';
  }
}