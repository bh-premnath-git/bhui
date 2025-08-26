import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Search, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useConversation } from '@/hooks/useConversation'
import { toNumber } from '@/lib/utils'
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
}

interface StreamResponse {
  status?: 'streaming' | 'complete' | 'error';
  error?: string;

  // derive from MetaStartedEvent
  title?: MetaStartedEvent["meta"]["title"];
  input_question?: MetaStartedEvent["data"]["input_question"];
  request_id?: MetaStartedEvent["meta"]["request_id"];

  // derive from individual events
  identify?: IdentifyEvent["content"];          // IDENTIFY
  sql?: SqlEvent["content"];                    // SQL (nullable in schema)
  table?: TableEvent["content"];                // TABLE
  explanation?: ExplanationEvent["content"];    // EXPLANATION

  // derive from MetaCompletedEvent
  duration_ms?: MetaCompletedEvent["data"]["duration_ms"];
  results_summary?: MetaCompletedEvent["data"]["results_summary"];

  // Progressive loading states
  currentStep?: 'thinking' | 'identifying' | 'generating_sql' | 'fetching_data' | 'explaining' | 'complete';
  completedSteps?: string[];
}

export const ExploreDataComponent: React.FC<ExploreDataComponentProps> = ({ query, connection, threadId }) => {
  const { streamConversation } = useConversation();
  const streamAbortRef = useRef<(() => void) | null>(null);
  const [response, setResponse] = useState<StreamResponse>({});

  const isStreaming = response.status === 'streaming';

  const onComplete = () => {
    setResponse(prev => ({ ...prev, status: 'complete', currentStep: 'complete' }));
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
      currentStep: 'thinking',
      completedSteps: [],
    }));
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
      identify: evt.content,
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

  // Map each typed chunk into UI state
  const onChunk = (chunk: StreamingChunk) => {
    console.log('Received chunk:', chunk);
    
    if (isMetaStarted(chunk))   return handleMetaStarted(chunk);
    if (isMetaCompleted(chunk)) return handleMetaCompleted(chunk);
    if (isIdentify(chunk))      return handleIdentify(chunk);
    if (isSql(chunk))           return handleSql(chunk);
    if (isTable(chunk))         return handleTable(chunk);
    if (isExplanation(chunk))   return handleExplanation(chunk);

    console.warn("Unknown streaming chunk shape:", chunk);
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
      completedSteps: []
    }));

    streamAbortRef.current = streamConversation(
      connId,
      query,
      threadId,
      onChunk,       // now typed
      onComplete,
      onError
    );

    return () => {
      try { streamAbortRef.current?.(); } catch { /* no-op */ }
      streamAbortRef.current = null;
    };
  }, [connection?.id, query, threadId, streamConversation]);

  const getStepStatus = (step: string) => {
    if (response.completedSteps?.includes(step)) return 'completed';
    if (response.currentStep === step) return 'current';
    return 'pending';
  };

  const StepIndicator = ({ step, label }: { step: string; label: string }) => {
    const status = getStepStatus(step);
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
        status === 'completed' ? 'bg-green-100 text-green-700' :
        status === 'current' ? 'bg-blue-100 text-blue-700' :
        'bg-muted/50 text-muted-foreground'
      }`}>
        {status === 'completed' && <CheckCircle className="w-3 h-3" />}
        {status === 'current' && <Loader2 className="w-3 h-3 animate-spin" />}
        {status === 'pending' && <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top context card */}
        {(connection || query) && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                {connection && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Connected to</p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {connection.connection_config_name}
                      </p>
                    </div>
                  </div>
                )}
                {query && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Query</p>
                      <p className="text-sm text-foreground leading-relaxed">"{query}"</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main analysis card */}
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Data Exploration</CardTitle>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              {connection && (
                <>
                  <span className="bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                    {connection.connection_config_name}
                  </span>
                  {query && <ArrowRight className="w-4 h-4" />}
                </>
              )}
              {query && (
                <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">
                  {isStreaming ? "Analyzing..." : response.status === "complete" ? "Analysis Complete" : "Analysis Ready"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
              {response.title && <span className="px-2 py-1 rounded bg-muted/50">{response.title}</span>}
              {response.request_id && <span className="px-2 py-1 rounded bg-muted/50">{response.request_id}</span>}
            </div>

            {/* Progress Steps */}
            {isStreaming && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Progress</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <StepIndicator step="thinking" label="AI Thinking" />
                  <StepIndicator step="identifying" label="Identifying Source" />
                  <StepIndicator step="generating_sql" label="Generating SQL" />
                  <StepIndicator step="fetching_data" label="Fetching Data" />
                  <StepIndicator step="explaining" label="Generating Explanation" />
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {(!connection || !query) ? (
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
            ) : (
              <div className="space-y-4">
                {/* IDENTIFY */}
                {response.identify && (
                  <div className="text-sm text-muted-foreground animate-in fade-in duration-300">
                    Identified source: <span className="font-medium text-foreground">{response.identify}</span>
                  </div>
                )}

                {/* SQL */}
                {"sql" in response && (
                  <div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto animate-in fade-in duration-300">
                    <div className="text-xs text-muted-foreground mb-1">SQL</div>
                    <pre className="whitespace-pre-wrap break-words text-foreground">{response.sql ?? "(no SQL generated)"}</pre>
                  </div>
                )}

                {/* TABLE */}
                {response.table && (
                  <div className="text-left animate-in fade-in duration-300">
                    <div className="text-xs text-muted-foreground mb-2">Table Preview</div>
                    <div className="overflow-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {response.table.column_names.map((c, idx) => (
                              <th key={idx} className="text-left px-3 py-2 border-b">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {response.table.column_values.map((row, rIdx) => (
                            <tr key={rIdx} className="odd:bg-background even:bg-muted/10">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 border-b">{cell as any}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* EXPLANATION */}
                {response.explanation && (
                  <div className="text-left text-sm bg-muted/10 rounded-md p-3 animate-in fade-in duration-300">
                    <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                    <p className="text-foreground whitespace-pre-wrap break-words">{response.explanation}</p>
                  </div>
                )}

                {/* ERROR */}
                {response.status === "error" && response.error && (
                  <div className="text-left text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {response.error}
                  </div>
                )}

                {/* COMPLETED SUMMARY */}
                {response.status === "complete" && response.results_summary && (
                  <div className="text-xs text-muted-foreground animate-in fade-in duration-300">
                    Completed • Steps: {response.results_summary.steps_completed} • Tables: {response.results_summary.tables_generated}
                    {typeof response.duration_ms === "number" && ` • Duration: ${Math.round(response.duration_ms)} ms`}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
