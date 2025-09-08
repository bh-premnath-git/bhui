import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export interface BaseManager {
  mode: ChatMode;
  canHandle(mode: ChatMode): boolean;
  selectMode(dispatch: AppDispatch): void;
  generateResponse(userMessage: string): string;
  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean;
  getRenderer(): RendererId;
}

export interface ManagerContext {
  dispatch: AppDispatch;
  messages: Message[];
  currentMode: ChatMode;
  renderData: Record<string, unknown>;
}