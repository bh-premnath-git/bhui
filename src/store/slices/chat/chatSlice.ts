import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type LucideIcon } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  // Indicates content is being streamed (partial)
  isStreaming?: boolean;
  options?: string[];
  uiComponent?: (
    {
      type: 'Card';
      props: {
        title?: string;
        description?: string;
      };
      stepId?: string;
    } |
    {
      type: 'Input';
      props: {
        placeholder?: string;
        buttonLabel?: string;
      };
      stepId?: string;
    } |
    {
      type: 'TextArea';
      props: {
        placeholder?: string;
        buttonLabel?: string;
        rows?: number;
      };
      stepId?: string;
    }
  );
}

export interface RightComponent {
  componentType: 'RightAsideComponent';
  componentId: string;
  title: string;
  isVisible: boolean;
  // Optional extra configuration passed from workflow (e.g., toggle targets)
  extra?: any;
}

export interface ActionItem {
  id: number;
  title: string;
  icon: LucideIcon;
}

export interface Connection {
  id: number | string;
  connection_config_name: string;
}

interface ChatState {
  messages: Message[];
  currentInput: string;
  isTyping: boolean;
  isLoading: boolean;
  context: string;
  rightComponent: RightComponent | null;
  isRightAsideComponent: boolean; // Track if right aside component is open
  layoutMode: 'centered' | 'split';
  otherActions: ActionItem[] | null;
  selectedActionTitle: string | null;
  // Current workflow step that expects input
  currentInputStep: {
    stepId: string;
    inputKey: string;
  } | null;
  selectedConnection: Connection | null;
  threadId: string | null;
  // Bottom drawer (scoped to RightAsideComponent)
  bottomDrawer: {
    isOpen: boolean;
    title: string;
    height: number; // in px
    content: any | null; // JSX content; kept as any for flexibility
  };
}

const initialState: ChatState = {
  messages: [],
  currentInput: '',
  isTyping: false,
  isLoading: false,
  context: '',
  rightComponent: null,
  isRightAsideComponent: false,
  layoutMode: 'centered',
  otherActions: null,
  selectedActionTitle: null,
  currentInputStep: null,
  selectedConnection: null,
  threadId: null,
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
    setCurrentInput: (state, action: PayloadAction<string>) => {
      state.currentInput = action.payload;
    },
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const newMessage: Message = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      state.messages.push(newMessage);
    },
    // Add message with a specific id (for streaming updates)
    addMessageWithId: (
      state,
      action: PayloadAction<{ id: string; message: Omit<Message, 'id' | 'timestamp'> }>
    ) => {
      const { id, message } = action.payload;
      const newMessage: Message = {
        ...message,
        id,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(newMessage);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Update last AI message by ID (for streaming)
    updateMessageContent: (
      state,
      action: PayloadAction<{ id: string; content: string; isStreaming?: boolean }>
    ) => {
      const { id, content, isStreaming } = action.payload;
      const msg = state.messages.find((m) => m.id === id);
      if (msg && !msg.isUser) {
        msg.content = content;
        if (typeof isStreaming !== 'undefined') msg.isStreaming = isStreaming;
      }
    },
    setContext: (state, action: PayloadAction<string>) => {
      state.context = action.payload;
    },
    setRightComponent: (state, action: PayloadAction<RightComponent | null>) => {
      state.rightComponent = action.payload;
      state.isRightAsideComponent = action.payload !== null;
      state.layoutMode = action.payload ? 'split' : 'centered';
    },
    setIsRightAsideComponent: (state, action: PayloadAction<boolean>) => {
      state.isRightAsideComponent = action.payload;
    },
    setLayoutMode: (state, action: PayloadAction<'centered' | 'split'>) => {
      state.layoutMode = action.payload;
    },
    setOtherActions: (state, action: PayloadAction<ActionItem[] | null>) => {
      state.otherActions = action.payload;
    },
    setSelectedActionTitle: (state, action: PayloadAction<string | null>) => {
      state.selectedActionTitle = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setCurrentInputStep: (state, action: PayloadAction<{ stepId: string; inputKey: string } | null>) => {
      state.currentInputStep = action.payload;
    },
    setSelectedConnection: (state, action: PayloadAction<Connection | null>) => {
      state.selectedConnection = action.payload;
    },
    clearSelectedConnection: (state) => {
      state.selectedConnection = null;
    },
    setThreadId: (state, action: PayloadAction<string | null>) => {
      state.threadId = action.payload;
    },
    clearThreadId: (state) => {
      state.threadId = null;
    },
    // Bottom drawer reducers (RightAside scoped)
    openChatBottomDrawer: (state, action: PayloadAction<{ title?: string; content: any; height?: number }>) => {
      state.bottomDrawer.isOpen = true;
      state.bottomDrawer.title = action.payload.title ?? state.bottomDrawer.title;
      state.bottomDrawer.content = action.payload.content;
      if (action.payload.height) state.bottomDrawer.height = action.payload.height;
    },
    closeChatBottomDrawer: (state) => {
      state.bottomDrawer.isOpen = false;
      state.bottomDrawer.content = null;
      state.bottomDrawer.title = '';
    },
    setChatBottomDrawerHeight: (state, action: PayloadAction<number>) => {
      state.bottomDrawer.height = Math.max(100, Math.min(action.payload, Math.floor(window.innerHeight * 0.8)));
    },
  },
});

export const {
  setCurrentInput,
  addMessage,
  addMessageWithId,
  setTyping,
  setLoading,
  updateMessageContent,
  setContext,
  setRightComponent,
  setIsRightAsideComponent,
  setLayoutMode,
  setOtherActions,
  setSelectedActionTitle,
  clearMessages,
  setCurrentInputStep,
  setSelectedConnection,
  clearSelectedConnection,
  setThreadId,
  clearThreadId,
  openChatBottomDrawer,
  closeChatBottomDrawer,
  setChatBottomDrawerHeight,
} = chatSlice.actions;

export default chatSlice.reducer;