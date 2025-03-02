import { useState } from 'react';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    clearMessages
  };
};