import React from 'react';
import { Loader2, Search, Code, Database, FileText } from 'lucide-react';
import { DataTable } from './DataTable';
import { SqlBlock } from './SqlBlock';
import type { StreamingStep } from './StreamingStepIndicator';
import type { TableEvent, SqlEvent, IdentifyEvent, ExplanationEvent } from '@/types/streaming';

interface StreamingContentProps {
  currentStep?: StreamingStep;
  identify?: IdentifyEvent['content'][];
  sql?: SqlEvent['content'];
  table?: TableEvent['content'];
  explanation?: ExplanationEvent['content'];
  onCopy?: (text: string) => void;
}

export const StreamingContent: React.FC<StreamingContentProps> = ({
  currentStep,
  identify,
  sql,
  table,
  explanation,
  onCopy
}) => {
  const identifyLabel = identify?.join(', ');
  const identifyPlural = (identify?.length || 0) > 1;

  if (!currentStep) {
    return (
      <div className="flex flex-col items-center space-y-4 py-8">
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Processing...</p>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'thinking':
        return (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground">AI is analyzing your query...</p>
          </div>
        );

      case 'identifying':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Search className="w-8 h-8 text-green-500" />
              <p className="text-sm text-muted-foreground">Identifying data sources...</p>
            </div>
            {identifyLabel && (
              <div className="text-sm text-muted-foreground animate-in fade-in duration-300">
                Identified {identifyPlural ? 'sources' : 'source'}: <span className="font-medium text-foreground">{identifyLabel}</span>
              </div>
            )}
          </div>
        );

      case 'generating_sql':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Code className="w-8 h-8 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Generating SQL query...</p>
            </div>
            {identifyLabel && (
              <div className="text-sm text-muted-foreground">
                Source{identifyPlural ? 's' : ''}: <span className="font-medium text-foreground">{identifyLabel}</span>
              </div>
            )}
            {sql && (
              <div className="animate-in fade-in duration-300">
                <SqlBlock title="Generated SQL" sql={sql} canCopy={!!onCopy} />
              </div>
            )}
          </div>
        );

      case 'fetching_data':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Database className="w-8 h-8 text-purple-500" />
              <p className="text-sm text-muted-foreground">Executing query and fetching data...</p>
            </div>
            {identifyLabel && (
              <div className="text-sm text-muted-foreground">
                Source{identifyPlural ? 's' : ''}: <span className="font-medium text-foreground">{identifyLabel}</span>
              </div>
            )}
            {sql && <SqlBlock title="SQL Query" sql={sql} canCopy={!!onCopy} />}
            {table && (
              <div className="text-left animate-in fade-in duration-300">
                <div className="text-xs text-muted-foreground mb-2">Data Retrieved</div>
                <DataTable table={table} />
              </div>
            )}
          </div>
        );

      case 'explaining':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-4">
              <FileText className="w-8 h-8 text-orange-500" />
              <p className="text-sm text-muted-foreground">Generating explanation...</p>
            </div>
            {identifyLabel && (
              <div className="text-sm text-muted-foreground">
                Source{identifyPlural ? 's' : ''}: <span className="font-medium text-foreground">{identifyLabel}</span>
              </div>
            )}
            {sql && <SqlBlock title="SQL Query" sql={sql} canCopy={!!onCopy} />}
            {table && (
              <div className="text-left">
                <div className="text-xs text-muted-foreground mb-2">Results</div>
                <DataTable table={table} />
              </div>
            )}
            {explanation && (
              <div className="text-left text-sm bg-muted/10 rounded-md p-3 animate-in fade-in duration-300">
                <div className="text-xs text-muted-foreground mb-1">Analysis</div>
                <p className="text-foreground whitespace-pre-wrap break-words">{explanation}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        );
    }
  };

  return <div className="space-y-6">{renderStepContent()}</div>;
};
