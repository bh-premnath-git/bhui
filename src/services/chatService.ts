import { ManagerFactory, detectModeFromQuery } from './managers/ManagerFactory';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

class ChatService {
  private isReady = true;

  canSendMessage(): boolean {
    return this.isReady;
  }

  setReady(ready: boolean) {
    this.isReady = ready;
  }

  selectMode(mode: ChatMode, dispatch: AppDispatch): void {
    const manager = ManagerFactory.getManager(mode);
    manager.selectMode(dispatch);
  }

  generateResponse(mode: ChatMode, userMessage: string): string {
    const manager = ManagerFactory.getManager(mode);
    return manager.generateResponse(userMessage);
  }

  shouldSwitchToTwoColumn(mode: ChatMode, messages: Message[], data: Record<string, unknown>): boolean {
    const manager = ManagerFactory.getManager(mode);
    return manager.shouldSwitchToTwoColumn(messages, data);
  }

  getRenderer(mode: ChatMode): RendererId {
    const manager = ManagerFactory.getManager(mode);
    return manager.getRenderer();
  }

  detectModeFromQuery(query: string): ChatMode | null {
    return detectModeFromQuery(query);
  }
}

export const chatService = new ChatService();