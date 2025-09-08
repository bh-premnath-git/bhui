import { BaseManager } from './types';
import { ChatMode, Message } from '@/store/slices/chat/chatSlice';
import { setRenderer, RendererId } from '@/store/slices/chat/renderSlice';
import { AppDispatch } from '@/store';

export class ReportGeneratorManager implements BaseManager {
  mode: ChatMode = 'generate-report';

  canHandle(mode: ChatMode): boolean {
    return mode === 'generate-report';
  }

  selectMode(dispatch: AppDispatch): void {
    dispatch(setRenderer('wip-placeholder'));
  }

  generateResponse(userMessage: string): string {
    return `I've generated a comprehensive report based on your data:

**Executive Summary:**
- Key Performance Indicators
- Trend Analysis
- Risk Assessment

**Detailed Sections:**
- Data Quality Assessment
- Performance Metrics
- Actionable Recommendations

The full report is available for download and includes interactive charts and detailed appendices.`;
  }

  shouldSwitchToTwoColumn(messages: Message[], data: Record<string, unknown>): boolean {
    return false; // This mode doesn't need two columns yet
  }

  getRenderer(): RendererId {
    return 'wip-placeholder';
  }
}