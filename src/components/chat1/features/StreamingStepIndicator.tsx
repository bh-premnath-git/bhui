import React from 'react';
import { CheckCircle, Loader2, Brain, Search, Code, Database, FileText, AlertCircle } from 'lucide-react';

export type StreamingStep = 'thinking' | 'identifying' | 'generating_sql' | 'fetching_data' | 'explaining' | 'complete';
export type StreamingStatus = 'streaming' | 'complete' | 'error';

interface StreamingStepIndicatorProps {
  currentStep?: StreamingStep;
  status: StreamingStatus;
  // Optional props for completed analysis tabs
  activeTab?: 'overview' | 'table' | 'sql';
  onTabChange?: (tab: 'overview' | 'table' | 'sql') => void;
}

const stepConfig = {
  thinking: { icon: Brain, label: 'AI Thinking', color: 'text-blue-500', animate: false },
  identifying: { icon: Search, label: 'Identifying Source', color: 'text-green-500', animate: false },
  generating_sql: { icon: Code, label: 'Generating SQL', color: 'text-yellow-500', animate: false },
  fetching_data: { icon: Database, label: 'Fetching Data', color: 'text-purple-500', animate: false },
  explaining: { icon: FileText, label: 'Generating Explanation', color: 'text-orange-500', animate: false },
  complete: { icon: CheckCircle, label: 'Analysis Complete', color: 'text-green-500', animate: false }
};

export const StreamingStepIndicator: React.FC<StreamingStepIndicatorProps> = ({ 
  currentStep, 
  status,
  activeTab,
  onTabChange
}) => {
  const getIconAndLabel = () => {
    if (status === 'error') {
      return { 
        icon: AlertCircle, 
        label: 'Analysis Failed', 
        color: 'text-red-500',
        animate: false
      };
    }

    if (status === 'complete') {
      return stepConfig.complete;
    }

    if (currentStep && stepConfig[currentStep]) {
      return stepConfig[currentStep];
    }

    return { 
      icon: Loader2, 
      label: 'Processing...', 
      color: 'text-gray-500',
      animate: true 
    };
  };

  const { icon: Icon, label, color, animate = false } = getIconAndLabel();

  const showTabs = status === 'complete' && activeTab && onTabChange;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color} ${animate ? 'animate-spin' : ''}`} />
        <span className="text-lg font-semibold">{label}</span>
      </div>
      
      {showTabs && (
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              activeTab === 'overview' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted hover:bg-muted/80 border-muted-foreground/20'
            }`}
          >
            <FileText className="w-3 h-3 inline mr-1" />
            Overview
          </button>
          <button
            onClick={() => onTabChange('table')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              activeTab === 'table' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted hover:bg-muted/80 border-muted-foreground/20'
            }`}
          >
            <Database className="w-3 h-3 inline mr-1" />
            Table
          </button>
          <button
            onClick={() => onTabChange('sql')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              activeTab === 'sql' 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-muted hover:bg-muted/80 border-muted-foreground/20'
            }`}
          >
            <Code className="w-3 h-3 inline mr-1" />
            SQL
          </button>
        </div>
      )}
    </div>
  );
};
