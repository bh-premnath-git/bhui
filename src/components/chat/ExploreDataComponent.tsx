import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConversation } from '@/hooks/useConversation'
import { toNumber } from '@/lib/utils'
import { StreamingStepIndicator, type StreamingStep, type StreamingStatus } from './features/StreamingStepIndicator';
import { StreamingContent } from './features/StreamingContent';
import { AnalysisMetrics } from './features/AnalysisMetrics';
import { OverviewTab } from './tabs/OverviewTab';
import { TableTab } from './tabs/TableTab';
import { SqlTab } from './tabs/SqlTab';
import type {
  StreamingChunk,
  TableEvent,
  SqlEvent,
  ExplanationEvent,
  IdentifyEvent,
  MetaStartedEvent,
  MetaCompletedEvent,
} from "@/types/streaming";
import {
  isMetaStarted,
  isMetaCompleted,
  isSql,
  isTable,
  isExplanation,
  isIdentify,
} from "@/types/streaming";

interface Connection {
  id: number | string;
  connection_config_name: string;
}

interface ExploreDataComponentProps {
  query?: string;
  connection?: Connection;
  threadId?: string;
  onTitleChange?: (title?: string) => void;
}

interface StreamResponse {
  status?: StreamingStatus;
  error?: string;

  // derive from MetaStartedEvent
  title?: MetaStartedEvent["meta"]["title"];
  input_question?: MetaStartedEvent["data"]["input_question"];
  request_id?: MetaStartedEvent["meta"]["request_id"];

  // derive from individual events
  identify?: IdentifyEvent["content"][];
  sql?: SqlEvent["content"];
  table?: TableEvent["content"];
  explanation?: ExplanationEvent["content"];

  // derive from MetaCompletedEvent
  duration_ms?: MetaCompletedEvent["data"]["duration_ms"];
  results_summary?: MetaCompletedEvent["data"]["results_summary"];

  // Progressive loading states
  currentStep?: StreamingStep;
  completedSteps?: string[];
}

export const ExploreDataComponent: React.FC<ExploreDataComponentProps> = ({ query, connection, threadId, onTitleChange }) => {
  const { streamConversation } = useConversation();
  const streamAbortRef = useRef<(() => void) | null>(null);
  const [response, setResponse] = useState<StreamResponse>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'sql'>('overview');

  const isStreaming = response.status === 'streaming';

  const onComplete = () => {
    setResponse(prev => ({ ...prev, status: 'complete', currentStep: 'complete' }));
    setActiveTab('overview'); // Reset to overview on completion
    streamAbortRef.current = null;
  };

  const onError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message :
      typeof err === 'string' ? err :
      'An error occurred while streaming';
    setResponse(prev => ({ ...prev, status: 'error', error: message }));
  };

  const handleMetaStarted = (evt: MetaStartedEvent) => {
    setResponse(prev => ({
      ...prev,
      status: 'streaming',
      title: evt.meta.title,
      input_question: evt.data.input_question,
      request_id: evt.meta.request_id,
      identify: [],
      currentStep: 'thinking',
      completedSteps: [],
    }));
    onTitleChange?.(evt.meta.title);
  };

  const handleMetaCompleted = (evt: MetaCompletedEvent) => {
    setResponse(prev => ({
      ...prev,
      status: 'complete',
      duration_ms: evt.data.duration_ms,
      results_summary: evt.data.results_summary,
      currentStep: 'complete',
      completedSteps: ['thinking', 'identifying', 'generating_sql', 'fetching_data', 'explaining']
    }));
  };

  const handleIdentify = (evt: IdentifyEvent) => {
    setResponse(prev => ({
      ...prev,
      identify: [...(prev.identify || []), evt.content],
      currentStep: 'identifying',
      completedSteps: [...new Set([...(prev.completedSteps || []), 'thinking'])]
    }));
  };

  const handleSql = (evt: SqlEvent) => {
    setResponse(prev => ({
      ...prev,
      sql: evt.content,
      currentStep: 'generating_sql',
      completedSteps: [...new Set([...(prev.completedSteps || []), 'thinking', 'identifying'])]
    }));
  };

  const handleTable = (evt: TableEvent) => {
    setResponse(prev => ({
      ...prev,
      table: evt.content,
      currentStep: 'fetching_data',
      completedSteps: [...new Set([...(prev.completedSteps || []), 'thinking', 'identifying', 'generating_sql'])]
    }));
  };

  const handleExplanation = (evt: ExplanationEvent) => {
    setResponse(prev => ({
      ...prev,
      explanation: evt.content,
      currentStep: 'explaining',
      completedSteps: [...new Set([...(prev.completedSteps || []), 'thinking', 'identifying', 'generating_sql', 'fetching_data'])]
    }));
  };

  const onChunk = (chunk: StreamingChunk) => {
    if (isMetaStarted(chunk)) return handleMetaStarted(chunk);
    if (isMetaCompleted(chunk)) return handleMetaCompleted(chunk);
    if (isIdentify(chunk)) return handleIdentify(chunk);
    if (isSql(chunk)) return handleSql(chunk);
    if (isTable(chunk)) return handleTable(chunk);
    if (isExplanation(chunk)) return handleExplanation(chunk);
  };

  useEffect(() => {
    if (!connection?.id || !query || !threadId) return;

    const connId = toNumber(connection.id);
    if (connId === null) {
      onError(new Error('Invalid connection id'));
      return;
    }

    setResponse(prev => ({
      ...prev,
      status: 'streaming',
      currentStep: undefined,
      completedSteps: [],
      identify: [],
    }));
    onTitleChange?.(undefined);

    streamAbortRef.current = streamConversation(
      connId,
      query,
      threadId,
      onChunk,
      onComplete,
      onError
    );

    return () => {
      try { streamAbortRef.current?.(); } catch { /* no-op */ }
      streamAbortRef.current = null;
    };
  }, [connection?.id, query, threadId, streamConversation]);

  const handleCopy = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback noop
    }
  };

  const renderCompletedContent = () => {
    if (response.error) {
      return (
        <div className="text-left text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 animate-in fade-in duration-300">
          {response.error}
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab explanation={response.explanation} table={response.table} />;
      case 'table':
        return <TableTab table={response.table} />;
      case 'sql':
        return <SqlTab sql={response.sql} />;
      default:
        return <OverviewTab explanation={response.explanation} table={response.table} />;
    }
  };

  const renderContent = () => {
    if (!connection || !query) {
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {!connection && !query && "No connection or query information available."}
            {!connection && query && "Connection information is missing."}
            {connection && !query && "Query information is missing."}
          </p>
          <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              Please select a connection and provide a query to start data exploration.
            </p>
          </div>
        </div>
      );
    }

    if (isStreaming) {
      return (
        <StreamingContent
          currentStep={response.currentStep}
          identify={response.identify}
          sql={response.sql}
          table={response.table}
          explanation={response.explanation}
          onCopy={handleCopy}
        />
      );
    }

    return (
      <div className="space-y-4">
        <AnalysisMetrics
          identify={response.identify}
          duration_ms={response.duration_ms}
          results_summary={response.results_summary}
        />
        <div className="animate-in fade-in duration-300">
          {renderCompletedContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-2">
      <div className="w-full space-y-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                <StreamingStepIndicator
                  currentStep={response.currentStep}
                  status={response.status || 'streaming'}
                  activeTab={response.status === 'complete' ? activeTab : undefined}
                  onTabChange={response.status === 'complete' ? setActiveTab : undefined}
                />
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
