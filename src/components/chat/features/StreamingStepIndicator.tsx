import React from 'react';
import { CheckCircle, Loader2, Brain, Search, Code, Database, FileText, AlertCircle } from 'lucide-react';

export type StreamingStep = 'thinking' | 'identifying' | 'generating_sql' | 'fetching_data' | 'explaining' | 'complete';
export type StreamingStatus = 'streaming' | 'complete' | 'error';

interface StreamingStepIndicatorProps {
  currentStep?: StreamingStep;
  status: StreamingStatus;
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
  status 
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

  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color} ${animate ? 'animate-spin' : ''}`} />
      <span className="text-lg font-semibold">{label}</span>
    </div>
  );
};
