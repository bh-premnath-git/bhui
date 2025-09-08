import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class AddUserManager implements BaseManager {
  mode: ChatMode = 'add-user';

  canHandle(mode: ChatMode): boolean {
    return mode === 'add-user';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `🚧 **User & Role Management - Under Development**

This feature is currently being built. You'll be able to manage users and roles here soon.

In the meantime, you can try other available features like Pipeline Creation or Data Explorer.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return true; // Switch to two-column to show user management interface
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}