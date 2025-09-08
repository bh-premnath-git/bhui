import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStage = 'idle' | 'thinking' | 'tool' | 'rendering' | 'complete' | 'error';
export type ChatMode = 'create-pipeline' | 'explore-data' | 'analyze-code' | 'generate-report' | 'optimize-query' | 'check-jobs' | 'add-user' | 'add-connection' | 'onboard-dataset' | 'add-project' | 'add-environment' | 'default';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  stage?: MessageStage;
  metadata?: Record<string, unknown>;
}

interface Suggestion {
  id: string;
  text: string;
  mode?: ChatMode;
  icon?: string;
}

interface ChatState {
  threadId: string | null;
  messages: Message[];
  input: string;
  currentMode: ChatMode;
  isStreaming: boolean;
  messageStages: Record<string, MessageStage>;
  suggestions: Suggestion[];
  virtualizedItems: (Message | { id: string; isStreamingIndicator: true })[];
  // Bottom drawer scoped to right-aside components
  bottomDrawer: {
    isOpen: boolean;
    title: string;
    height: number; // px
    content: any | null;
  };
}

const defaultSuggestions: Suggestion[] = [
  { id: 'create-pipeline', text: 'Create Pipeline', mode: 'create-pipeline', icon: 'Pipeline' },
  { id: 'explore-data', text: 'Explore Data', mode: 'explore-data', icon: 'BarChart3' },
  { id: 'analyze-code', text: 'Analyze Code', mode: 'analyze-code', icon: 'Code' },
  { id: 'generate-report', text: 'Generate Report', mode: 'generate-report', icon: 'FileText' },
  { id: 'optimize-query', text: 'Optimize Query', mode: 'optimize-query', icon: 'Zap' },
];

const initialState: ChatState = {
  threadId: null,
  messages: [],
  input: '',
  currentMode: 'default',
  isStreaming: false,
  messageStages: {},
  suggestions: defaultSuggestions,
  virtualizedItems: [],
  bottomDrawer: {
    isOpen: false,
    title: '',
    height: 300,
    content: null,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload;
    },
    setMode: (state, action: PayloadAction<ChatMode>) => {
      state.currentMode = action.payload;
    },
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const message: Message = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      state.messages.push(message);
      // Update virtualized items
      state.virtualizedItems = [...state.messages];
      if (state.isStreaming) {
        state.virtualizedItems.push({ id: 'streaming', isStreamingIndicator: true });
      }
    },
    updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
      const { id, updates } = action.payload;
      const messageIndex = state.messages.findIndex(m => m.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = { ...state.messages[messageIndex], ...updates };
        // Update virtualized items
        state.virtualizedItems = [...state.messages];
        if (state.isStreaming) {
          state.virtualizedItems.push({ id: 'streaming', isStreamingIndicator: true });
        }
      }
    },
    setMessageStage: (state, action: PayloadAction<{ messageId: string; stage: MessageStage }>) => {
      const { messageId, stage } = action.payload;
      state.messageStages[messageId] = stage;
    },
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
      // Update virtualized items based on streaming state
      state.virtualizedItems = [...state.messages];
      if (action.payload) {
        state.virtualizedItems.push({ id: 'streaming', isStreamingIndicator: true });
      }
    },
    setSuggestions: (state, action: PayloadAction<Suggestion[]>) => {
      state.suggestions = action.payload;
    },
    // Bottom drawer reducers
    openChatBottomDrawer: (
      state,
      action: PayloadAction<{ title?: string; content: any; height?: number }>
    ) => {
      state.bottomDrawer.isOpen = true;
      state.bottomDrawer.title = action.payload.title ?? state.bottomDrawer.title;
      state.bottomDrawer.content = action.payload.content;
      if (action.payload.height) {
        state.bottomDrawer.height = Math.max(100, Math.min(action.payload.height, Math.floor(window.innerHeight * 0.8)));
      }
    },
    closeChatBottomDrawer: (state) => {
      state.bottomDrawer.isOpen = false;
      state.bottomDrawer.content = null;
    },
    setChatBottomDrawerHeight: (state, action: PayloadAction<number>) => {
      state.bottomDrawer.height = Math.max(100, Math.min(action.payload, Math.floor(window.innerHeight * 0.8)));
    },
    clearMessages: (state) => {
      state.messages = [];
      state.messageStages = {};
      state.virtualizedItems = [];
    },
    createNewThread: (state) => {
      state.threadId = state.threadId ? state.threadId : null;
      state.messages = [];
      state.messageStages = {};
      state.currentMode = 'default';
      state.virtualizedItems = [];
    },
    setThreadId: (state, action: PayloadAction<string>) => {
      state.threadId = action.payload;
    },
    clearThreadId: (state) => {
      state.threadId = null;
    },
    clearState: () => initialState,
  },
});

export const {
  setInput,
  setMode,
  addMessage,
  updateMessage,
  setMessageStage,
  setStreaming,
  setSuggestions,
  clearMessages,
  createNewThread,
  clearState,
  setThreadId,
  clearThreadId,
  openChatBottomDrawer,
  closeChatBottomDrawer,
  setChatBottomDrawerHeight,
} = chatSlice.actions;
export default chatSlice.reducer;