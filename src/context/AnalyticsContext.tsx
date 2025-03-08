import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Connection, RecentChat, useConnections } from '@/hooks/useConnections';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { Message } from '@/types/data-catalog/xplore/type';
import { useDashboard } from './DashboardContext';

interface AnalyticsContextType {
  currentQuestion: string;
  input: string;
  setInput: (input: string) => void;
  selectedConnection: string;
  selectedRecent: string | null;
  selectedName: string;
  connections: Connection[];
  recentChats: RecentChat[];
  isLoading: boolean;
  error: string | null;
  handleConnectionSelect: (connection: Connection) => void;
  handleRecentSelect: (chat: RecentChat) => void;
  addConnection: (connection: Omit<Connection, 'id'>) => Promise<Connection>;
  addRecentChat: (chat: Omit<RecentChat, 'id'>) => Promise<RecentChat>;
  messages: Message[];
  isStreaming: boolean;
  handleSubmitQuestion: (question: string) => Promise<void>;
  handleSuggestedQuestion: (question: string) => void;
  handleNewChat: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [input, setInput] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedRecent, setSelectedRecent] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [shouldSaveDashboard, setShouldSaveDashboard] = useState(false);

  const {
    connections,
    recentChats,
    isLoading,
    error,
    addConnection,
    addRecentChat,
  } = useConnections();

  const {
    isStreaming,
    streamedContent,
    streamedData,
    startStreaming,
    resetStream,
  } = useStreamingResponse();

  const { saveDashboard } = useDashboard();

  useEffect(() => {
    if (!isLoading && connections.length > 0 && !selectedConnection && !selectedRecent) {
      const defaultConnection = connections[0];
      setSelectedConnection(defaultConnection.id);
      setSelectedName(defaultConnection.name);
    }
  }, [isLoading, connections, selectedConnection, selectedRecent]);

  useEffect(() => {
    if (streamedContent !== undefined) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant') {
          if (streamedContent || (streamedData && streamedData.length > 0)) {
            const existingContent = lastMessage.content || '';
            const newContent = streamedContent || '';
            
            const finalContent = newContent.length < existingContent.length ? existingContent : newContent;

            const updatedMessage = {
              ...lastMessage,
              content: finalContent,
              data: streamedData || lastMessage.data,
            };
            return [...prev.slice(0, -1), updatedMessage];
          }
          return prev;
        }
        
        if (streamedContent || (streamedData && streamedData.length > 0)) {
          const newMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: streamedContent || '',
            data: streamedData || [],
            timestamp: new Date(),
          };
          return [...prev, newMessage];
        }
        return prev;
      });

      if (!isStreaming && streamedData?.length > 0 && shouldSaveDashboard) {
        setShouldSaveDashboard(false);
        saveDashboard({
          name: currentQuestion.slice(0, 30) + (currentQuestion.length > 30 ? '...' : ''),
          content: streamedContent || '',
          data: streamedData,
          timestamp: new Date(),
          connectionId: selectedConnection,
        });
      }
    }
  }, [streamedContent, streamedData, isStreaming, currentQuestion, selectedConnection, saveDashboard, shouldSaveDashboard]);

  const handleSubmitQuestion = useCallback(async (question: string) => {
    setCurrentQuestion(question);
    setShouldSaveDashboard(true);
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: question,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    await startStreaming(question);
    
    const chatName = question.slice(0, 30) + (question.length > 30 ? '...' : '');
    await addRecentChat({ name: chatName });
  }, [startStreaming, addRecentChat]);

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInput(question);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
    setCurrentQuestion("");
    setShouldSaveDashboard(false);
    resetStream();
  }, [resetStream]);

  const handleConnectionSelect = useCallback((connection: Connection) => {
    setSelectedConnection(connection.id);
    setSelectedRecent(null);
    setSelectedName(connection.name);
  }, []);

  const handleRecentSelect = useCallback((chat: RecentChat) => {
    setSelectedConnection("");
    setSelectedRecent(chat.id);
    setSelectedName(chat.name);
  }, []);

  const value = useMemo(() => ({
    currentQuestion,
    input,
    setInput,
    selectedConnection,
    selectedRecent,
    selectedName,
    connections,
    recentChats,
    isLoading,
    error,
    handleConnectionSelect,
    handleRecentSelect,
    addConnection,
    addRecentChat,
    messages,
    isStreaming,
    handleSubmitQuestion,
    handleSuggestedQuestion,
    handleNewChat,
  }), [
    currentQuestion,
    input,
    selectedConnection,
    selectedRecent,
    selectedName,
    connections,
    recentChats,
    isLoading,
    error,
    handleConnectionSelect,
    handleRecentSelect,
    addConnection,
    addRecentChat,
    messages,
    isStreaming,
    handleSubmitQuestion,
    handleSuggestedQuestion,
    handleNewChat,
  ]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};