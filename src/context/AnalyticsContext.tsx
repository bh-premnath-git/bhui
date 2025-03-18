import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Connection, RecentChat, useConnections } from '@/hooks/useConnections';
import { useStreamingResponse } from '@/hooks/useStreamingResponse';
import { Message } from '@/types/data-catalog/xplore/type';
import { useDashboard } from './DashboardContext';
import { useXplore } from '@/features/data-catalog/hooks/useXplore';
import { toast } from 'sonner';

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
  handleNewChat: () => Promise<string | null>;
  threadId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Debounce utility to prevent multiple rapid calls
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): F => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as F;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [input, setInput] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [selectedRecent, setSelectedRecent] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [shouldSaveDashboard, setShouldSaveDashboard] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  // Add a ref to track in-flight request
  const createConversationRequestRef = useRef<Promise<any> | null>(null);

  const { createConversation } = useXplore();

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

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInput(question);
  }, []);

  // Memoize the debounced version of handleNewChat's implementation
  const createNewConversation = useMemo(() => 
    debounce(async (): Promise<string | null> => {
      console.log("[Analytics] Debounced createNewConversation called");
      
      // If already creating, return the existing promise
      if (isCreatingConversation && createConversationRequestRef.current) {
        console.log("[Analytics] Creation already in progress, returning existing promise");
        return createConversationRequestRef.current;
      }
      
      try {
        console.log("[Analytics] Starting new conversation");
        setIsCreatingConversation(true);
        setMessages([]);
        setInput("");
        setCurrentQuestion("");
        setShouldSaveDashboard(false);
        resetStream();
        
        // Create a new promise and store the reference
        const conversationPromise = createConversation()
          .then(response => {
            if (response.data.thread_id) {
              const newThreadId = response.data.thread_id;
              console.log(`[Analytics] New conversation started with thread_id: ${newThreadId}`);
              setThreadId(newThreadId);
              window.dispatchEvent(new CustomEvent('xplorer:new-chat'));
              return newThreadId;
            } else {
              console.error("[Analytics] No thread_id returned from createConversation");
              toast.error("Failed to start new conversation: No thread ID returned");
              return null;
            }
          })
          .catch(error => {
            console.error("[Analytics] Failed to start new conversation:", error);
            toast.error("Failed to start new conversation");
            return null;
          })
          .finally(() => {
            setIsCreatingConversation(false);
            createConversationRequestRef.current = null;
          });
          
        createConversationRequestRef.current = conversationPromise;
        return conversationPromise;
      } catch (error) {
        console.error("[Analytics] Failed to start new conversation:", error);
        toast.error("Failed to start new conversation");
        setIsCreatingConversation(false);
        createConversationRequestRef.current = null;
        return null;
      }
    }, 300), // 300ms debounce to prevent rapid successive calls
  [resetStream, createConversation]);

  const handleNewChat = useCallback(async (): Promise<string | null> => {
    console.log("[Analytics] handleNewChat called");
    return createNewConversation();
  }, [createNewConversation]);

  useEffect(() => {
    if (selectedConnection && !threadId && !isCreatingConversation && !createConversationRequestRef.current) {
      console.log("[Analytics] Creating new conversation from effect");
      handleNewChat();
    }
  }, [selectedConnection, threadId, isCreatingConversation, handleNewChat]);

  const handleSubmitQuestion = useCallback(async (question: string) => {
    console.log(`Submitting question: "${question}", current threadId: ${threadId}`);
    
    // Reset the stream state to clear previous responses
    resetStream();
    
    let currentThreadId = threadId;
    if (!currentThreadId) {
      console.log("No active thread, creating a new conversation");
      currentThreadId = await handleNewChat();
      if (!currentThreadId) {
        toast.error("Unable to start conversation. Please try again.");
        return;
      }
    }

    if (!selectedConnection) {
      toast.error("No connection selected. Please select a connection first.");
      return;
    }

    console.log(`Processing question with threadId: ${currentThreadId}, connection: ${selectedConnection}`);
    
    setCurrentQuestion(question);
    setShouldSaveDashboard(true);

    // Create and add the user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: question,
      role: 'user',
      timestamp: new Date(),
    };

    // Add a temporary loading assistant message to indicate processing
    const tempAssistantMessage: Message = {
      id: crypto.randomUUID(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true, // Add this flag to indicate loading state
    };

    // Update the messages with both user question and loading indicator
    setMessages(prev => [...prev, userMessage, tempAssistantMessage]);
    
    // Start the streaming process
    await startStreaming(question, selectedConnection, currentThreadId);

    const chatName = question.slice(0, 30) + (question.length > 30 ? '...' : '');
    await addRecentChat({ name: chatName });
  }, [startStreaming, addRecentChat, threadId, handleNewChat, selectedConnection, resetStream]);

  const handleConnectionSelect = useCallback((connection: Connection) => {
    setSelectedConnection(connection.id);
    setSelectedRecent(null);
    setSelectedName(connection.name);
    setThreadId(null);
  }, []);

  const handleRecentSelect = useCallback((chat: RecentChat) => {
    setSelectedConnection("");
    setSelectedRecent(chat.id);
    setSelectedName(chat.name);
    setThreadId(null);
  }, []);

  useEffect(() => {
    if (streamedContent !== undefined) {
      setMessages(prev => {
        // Find the last assistant message (which should be our temporary loading message)
        const lastAssistantIndex = [...prev].reverse().findIndex(msg => msg.role === 'assistant');
        
        if (lastAssistantIndex !== -1) {
          const reversedIndex = lastAssistantIndex;
          const actualIndex = prev.length - 1 - reversedIndex;
          
          // Replace the temporary loading message with actual content
          const updatedMessages = [...prev];
          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            content: streamedContent || '',
            data: streamedData || [],
            isLoading: false,
            timestamp: new Date(),
          };
          
          return updatedMessages;
        }

        // If no assistant message found (should not happen), add a new one
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

  const value = useMemo(() => ({
    currentQuestion,
    input,
    setInput,
    selectedConnection,
    selectedRecent,
    selectedName,
    connections,
    recentChats,
    isLoading: isLoading || isCreatingConversation,
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
    threadId,
  }), [
    currentQuestion,
    input,
    selectedConnection,
    selectedRecent,
    selectedName,
    connections,
    recentChats,
    isLoading,
    isCreatingConversation,
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
    threadId,
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