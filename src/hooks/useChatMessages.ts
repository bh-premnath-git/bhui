import { useState, useCallback, ReactNode } from 'react';

type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  buttons?: ReactNode[];
  timestamp: number;
}

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addUserMessage = useCallback((content: string) => {
    const messageId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: messageId, 
      role: 'user', 
      content,
      timestamp: Date.now()
    }]);
    return messageId;
  }, []);

  const addAssistantMessage = useCallback((content: string, messageId?: string, buttons?: ReactNode[]) => {
    const id = messageId || `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id, 
      role: 'assistant', 
      content, 
      buttons,
      timestamp: Date.now()
    }]);
    return id;
  }, []);

  const updateLastAssistantMessage = useCallback((content: string) => {
    const newAssistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: content,
      timestamp: Date.now()
    };
    setMessages(prev => {
      const newMessages = [...prev, newAssistantMessage];
      return newMessages;
    });
  }, []);

  const updateMessageById = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, content: newContent } 
          : message
      )
    );
  }, []);

  const findMessageByContent = useCallback((content: string) => {
    return messages.find(message => message.content === content);
  }, [messages]);
  
  const findMessageById = useCallback((id: string) => {
    return messages.find(message => message.id === id);
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addUserMessage,
    addAssistantMessage,
    updateLastAssistantMessage,
    updateMessageById,
    findMessageByContent,
    findMessageById,
    clearMessages
  };
};