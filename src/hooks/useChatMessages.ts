import create from 'zustand';

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  clearMessages: () => void;
}

export const useChatMessages = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  addUserMessage: (content) =>
    set((state) => ({ 
      messages: [...state.messages, { role: "user", content }] 
    })),
  addAssistantMessage: (content) =>
    set((state) => ({ 
      messages: [...state.messages, { role: "assistant", content }] 
    })),
  clearMessages: () => set({ messages: [] }),
}));