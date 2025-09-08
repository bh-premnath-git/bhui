import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setMode } from '@/store/slices/chat/chatSlice';

export type ChatMode = 
  | 'default'
  | 'create-pipeline'
  | 'explore-data'
  | 'check-jobs'
  | 'add-user'
  | 'add-connection'
  | 'onboard-dataset'
  | 'add-project'
  | 'add-environment';

export interface ChatModeConfig {
  title: string;
  description: string;
  suggestedMessages: string[];
}

const chatModeConfigs: Record<ChatMode, ChatModeConfig> = {
  'default': {
    title: 'AI Assistant',
    description: 'How can I help you today?',
    suggestedMessages: []
  },
  'create-pipeline': {
    title: 'Create Pipeline',
    description: 'Let\'s build a data pipeline together',
    suggestedMessages: [
      'Create a new ETL pipeline',
      'Set up batch processing pipeline',
      'Configure real-time streaming pipeline',
      'Build ML training pipeline'
    ]
  },
  'explore-data': {
    title: 'Explore Data',
    description: 'Discover insights from your data',
    suggestedMessages: [
      'Show data schema overview',
      'Generate data quality report',
      'Find data correlations',
      'Visualize data distribution'
    ]
  },
  'check-jobs': {
    title: 'Check Jobs',
    description: 'Monitor and manage your running jobs',
    suggestedMessages: [
      'Show active job status',
      'Check failed jobs',
      'View job performance metrics',
      'Schedule new job runs'
    ]
  },
  'add-user': {
    title: 'Add User or Role',
    description: 'Manage users and permissions',
    suggestedMessages: [
      'Create new user account',
      'Assign user roles',
      'Set up permissions',
      'Configure access controls'
    ]
  },
  'add-connection': {
    title: 'Add New Connection',
    description: 'Connect to data sources',
    suggestedMessages: [
      'Connect to database',
      'Set up API connection',
      'Configure cloud storage',
      'Add streaming source'
    ]
  },
  'onboard-dataset': {
    title: 'Onboard New Dataset',
    description: 'Import and configure datasets',
    suggestedMessages: [
      'Upload CSV files',
      'Import from database',
      'Connect cloud dataset',
      'Set up data validation'
    ]
  },
  'add-project': {
    title: 'Add Project',
    description: 'Create and organize projects',
    suggestedMessages: [
      'Start new analytics project',
      'Create ML experiment',
      'Set up dashboard project',
      'Initialize data warehouse'
    ]
  },
  'add-environment': {
    title: 'Add Environment',
    description: 'Configure deployment environments',
    suggestedMessages: [
      'Set up development environment',
      'Configure staging environment',
      'Create production environment',
      'Add testing environment'
    ]
  }
};

export const useChatMode = () => {
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector(state => state.chat.currentMode);

  const setModeHandler = useCallback((mode: ChatMode) => {
    dispatch(setMode(mode));
  }, [dispatch]);

  const resetMode = useCallback(() => {
    dispatch(setMode('default'));
  }, [dispatch]);

  const getCurrentConfig = useCallback(() => {
    return chatModeConfigs[currentMode];
  }, [currentMode]);

  return {
    currentMode,
    setMode: setModeHandler,
    resetMode,
    getCurrentConfig,
    isDefaultMode: currentMode === 'default'
  };
};