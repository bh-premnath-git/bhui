import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set } from 'lodash';
import { type LucideIcon } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export interface ActionItem {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface ChatState {
  messages: Message[];
  currentInput: string;
  isTyping: boolean;
  isLoading: boolean;
  context: string;
  otherActions: ActionItem[] | null;
  selectedActionTitle: string | null;
}

const initialState: ChatState = {
  messages: [],
  currentInput: '',
  isTyping: false,
  isLoading: false,
  context: '',
  otherActions: null,
  selectedActionTitle: null,
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
    setOtherActions: (state, action: PayloadAction<ActionItem[] | null>) => {
      state.otherActions = action.payload;
    },
    setSelectedActionTitle: (state, action: PayloadAction<string | null>) => {
      state.selectedActionTitle = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setCurrentInput, addMessage, setTyping, setLoading, setContext, setOtherActions, setSelectedActionTitle, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;