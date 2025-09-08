import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class CheckJobsManager implements BaseManager {
  mode: ChatMode = 'check-jobs';

  canHandle(mode: ChatMode): boolean {
    return mode === 'check-jobs';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `🚧 **Job Management - Under Development**

This feature is currently being built. You'll be able to monitor and manage jobs here soon.

In the meantime, you can try other available features like Pipeline Creation or Data Explorer.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return true; // Switch to two-column to show job management interface
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}