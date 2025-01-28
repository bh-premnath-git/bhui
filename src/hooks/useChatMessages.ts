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
}

export const useChatMessages = create<ChatStore>((set) => ({
  messages: [
    {
        role: "assistant",
        content: "Hello! I can help you analyze your sales data. What would you like to know?",
      },
      {
        role: "user",
        content: "I want to see daily sales for each brand in the last week",
      },
      {
        role: "assistant",
        content: "I'll help you create a query to analyze daily sales by brand for the past week. This will show you the total sales amount for each brand, grouped by date.",
      },
      {
        role: "user",
        content: "Yes, that's exactly what I need",
      },
      {
        role: "assistant",
        content: "I've generated the SQL query for you. You can find it in the SQL Editor tab. The query will:\n\n1. Group sales by date and brand\n2. Calculate total sales for each group\n3. Show data for the last 7 days\n4. Sort results by date and brand name",
      }
  ],
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
}));