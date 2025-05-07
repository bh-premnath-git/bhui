import { useState, useCallback, ReactNode } from 'react';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
  buttons?: ReactNode[];
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
  }, []);

  const addAssistantMessage = useCallback((content: string, buttons?: ReactNode[]) => {
    setMessages(prev => [...prev, { role: 'assistant', content, buttons }]);
  }, []);

  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === 'assistant') {
          newMessages[i].content = content;
          break;
        }
      }
      return newMessages;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
    clearMessages
  };
};