import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class OnboardDatasetManager implements BaseManager {
  mode: ChatMode = 'onboard-dataset';

  canHandle(mode: ChatMode): boolean {
    return mode === 'onboard-dataset';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `🚧 **Dataset Onboarding - Under Development**

This feature is currently being built. You'll be able to onboard new datasets here soon.

In the meantime, you can try other available features like Pipeline Creation or Data Explorer.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return true; // Switch to two-column to show dataset onboarding interface
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}