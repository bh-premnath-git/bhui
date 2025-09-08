import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class AddEnvironmentManager implements BaseManager {
  mode: ChatMode = 'add-environment';

  canHandle(mode: ChatMode): boolean {
    return mode === 'add-environment';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `🚧 **Environment Management - Under Development**

This feature is currently being built. You'll be able to manage environments here soon.

In the meantime, you can try other available features like Pipeline Creation or Data Explorer.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return true; // Switch to two-column to show environment management interface
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}