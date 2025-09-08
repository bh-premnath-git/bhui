import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class DefaultManager implements BaseManager {
  mode: ChatMode = 'default';

  canHandle(mode: ChatMode): boolean {
    return mode === 'default';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `I understand you're asking about "${userMessage}". Based on your query, I can help you with:

**Suggested Actions:**
- 🔧 **Create Pipeline** - If you want to build a data processing workflow
- 📊 **Explore Data** - If you want to analyze and visualize data  
- 📝 **Generate Report** - If you want to create comprehensive reports
- ⚡ **Optimize Query** - If you want to improve performance

Please select a specific mode above or let me know more details about what you'd like to accomplish.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return false;
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}