import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'lodash';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  options?: string[];
  uiComponent?: {
    type: 'Card';
    props: {
      title?: string;
      description?: string;
    };
    stepId?: string;
  };
}

export interface RightComponent {
  componentType: 'RightAsideComponent';
  componentId: string;
  title: string;
  isVisible: boolean;
}

interface ChatState {
  messages: Message[];
  currentInput: string;
  isTyping: boolean;
  isLoading: boolean;
  context: string;
  rightComponent: RightComponent | null;
  layoutMode: 'centered' | 'split';
}

const initialState: ChatState = {
  messages: [],
  currentInput: '',
  isTyping: false,
  isLoading: false,
  context: '',
  rightComponent: null,
  layoutMode: 'centered',
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
        timestamp: new Date(),
      };
      state.messages.push(newMessage);
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setContext: (state, action: PayloadAction<string>) => {
      state.context = action.payload;
    },
    setRightComponent: (state, action: PayloadAction<RightComponent | null>) => {
      state.rightComponent = action.payload;
      state.layoutMode = action.payload ? 'split' : 'centered';
    },
    setLayoutMode: (state, action: PayloadAction<'centered' | 'split'>) => {
      state.layoutMode = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setCurrentInput, addMessage, setTyping, setLoading, setContext, setRightComponent, setLayoutMode, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;