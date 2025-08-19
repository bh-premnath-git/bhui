import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface ChatState {
  messages: Message[];
  currentInput: string;
  isTyping: boolean;
  isLoading: boolean;
}

const initialState: ChatState = {
  messages: [],
  currentInput: '',
  isTyping: false,
  isLoading: false,
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
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setCurrentInput, addMessage, setTyping, setLoading, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;