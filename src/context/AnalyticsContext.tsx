import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDashboard } from './DashboardContext';
import { Dashboard } from '@/types/dataops/dataops-dash';
import { Message } from '@/types/data-catalog/xplore/type';

interface CurrentDashboard {
  id: string;
  title: string;
}

interface AnalyticsContextType {
  currentDashboard: CurrentDashboard | null;
  setCurrentDashboard: (dashboard: CurrentDashboard) => void;
  messages: Message[];
  isStreaming: boolean;
  handleSubmitQuestion: (question: string) => void;
  handleSuggestedQuestion: (question: string) => void;
  input: string;
  setInput: (value: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDashboard, setCurrentDashboardState] = useState<CurrentDashboard | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState<string>('');
  const { dispatch } = useDashboard();

  const setCurrentDashboard = useCallback((dashboard: CurrentDashboard) => {
    setCurrentDashboardState(dashboard);
    
    // If we have a dashboard ID, we also want to set it as selected in the DashboardContext
    if (dashboard?.id) {
      // Create a properly formatted Dashboard object that matches the expected type
      const dashboardForContext: Dashboard = {
        id: parseInt(dashboard.id, 10) || 0,
        dashboard_id: parseInt(dashboard.id, 10) || 0,
        dashboard_name: dashboard.title,
        owner: '',
        dashboard_type: 'explorer',
        visibility: 'private',
        meta_data: {},
        dashboard_filters: [],
        dashboard_layout: []
      };
      
      dispatch({
        type: "SET_SELECTED_DASHBOARD",
        payload: dashboardForContext
      });
    }
  }, [dispatch]);

  const handleSubmitQuestion = useCallback((question: string) => {
    // Create a new message from the user
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    
    // Simulate assistant response (in a real app, this would be an API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a mock response to: ${question}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(false);
    }, 1000);
  }, []);

  const handleSuggestedQuestion = useCallback((question: string) => {
    handleSubmitQuestion(question);
  }, [handleSubmitQuestion]);

  const value = React.useMemo(() => ({
    currentDashboard,
    setCurrentDashboard,
    messages,
    isStreaming,
    handleSubmitQuestion,
    handleSuggestedQuestion,
    input,
    setInput
  }), [currentDashboard, setCurrentDashboard, messages, isStreaming, handleSubmitQuestion, handleSuggestedQuestion, input, setInput]);

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