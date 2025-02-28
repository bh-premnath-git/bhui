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
  updateLastAssistantMessage: (content: string) => void;
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
  updateLastAssistantMessage: (content) =>
    set((state) => {
      const newMessages = [...state.messages];
      // Find the last assistant message
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === "assistant") {
          newMessages[i] = { ...newMessages[i], content };
          return { messages: newMessages };
        }
      }
      // If no assistant message found, add a new one
      return { messages: [...newMessages, { role: "assistant", content }] };
    }),
  clearMessages: () => set({ messages: [] }),
}));