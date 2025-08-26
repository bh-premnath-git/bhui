import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Brain, Search, Code, Database, FileText, AlertCircle, Copy } from 'lucide-react';
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
      completedSteps: []
    }));

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
      // You can toast here if you have a toaster: toast.success('Copied SQL to clipboard')
    } catch {
      // fallback noop
    }
  };

  const metrics = (() => {
    const tablesGenerated = response.results_summary?.tables_generated;
    const duration = typeof response.duration_ms === 'number' ? `${(response.duration_ms / 1000).toFixed(1)}s` : undefined;
    return { tablesGenerated, duration };
  })();

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Main analysis card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {isStreaming ? (
                  response.currentStep === 'thinking' ? (
                    <Brain className="w-5 h-5 text-blue-500" />
                  ) : response.currentStep === 'identifying' ? (
                    <Search className="w-5 h-5 text-green-500" />
                  ) : response.currentStep === 'generating_sql' ? (
                    <Code className="w-5 h-5 text-yellow-500" />
                  ) : response.currentStep === 'fetching_data' ? (
                    <Database className="w-5 h-5 text-purple-500" />
                  ) : response.currentStep === 'explaining' ? (
                    <FileText className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                  )
                ) : response.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : response.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                )}
                {isStreaming ? (
                  response.currentStep === 'thinking' ? 'AI Thinking' :
                  response.currentStep === 'identifying' ? 'Identifying Source' :
                  response.currentStep === 'generating_sql' ? 'Generating SQL' :
                  response.currentStep === 'fetching_data' ? 'Fetching Data' :
                  response.currentStep === 'explaining' ? 'Generating Explanation' :
                  'Processing...'
                ) : response.status === 'complete' ? 'Analysis Complete' :
                  response.status === 'error' ? 'Analysis Failed' :
                  'Ready to Analyze'}
              </CardTitle>
            </div>
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
            ) : isStreaming ? (
              // STREAMING STATE - Show only current step content
              <div className="space-y-6">
                {response.currentStep === 'thinking' && (
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">AI is analyzing your query...</p>
                  </div>
                )}

                {response.currentStep === 'identifying' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Search className="w-8 h-8 text-green-500" />
                      <p className="text-sm text-muted-foreground">Identifying data sources...</p>
                    </div>
                    {response.identify && (
                      <div className="text-sm text-muted-foreground animate-in fade-in duration-300">
                        Identified source: <span className="font-medium text-foreground">{response.identify}</span>
                      </div>
                    )}
                  </div>
                )}

                {response.currentStep === 'generating_sql' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Code className="w-8 h-8 text-yellow-500" />
                      <p className="text-sm text-muted-foreground">Generating SQL query...</p>
                    </div>
                    {response.identify && (
                      <div className="text-sm text-muted-foreground">
                        Source: <span className="font-medium text-foreground">{response.identify}</span>
                      </div>
                    )}
                    {"sql" in response && response.sql && (
                      <div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-muted-foreground">Generated SQL</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(response.sql as string)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-foreground">{response.sql}</pre>
                      </div>
                    )}
                  </div>
                )}

                {response.currentStep === 'fetching_data' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Database className="w-8 h-8 text-purple-500" />
                      <p className="text-sm text-muted-foreground">Executing query and fetching data...</p>
                    </div>
                    {response.identify && (
                      <div className="text-sm text-muted-foreground">
                        Source: <span className="font-medium text-foreground">{response.identify}</span>
                      </div>
                    )}
                    {"sql" in response && response.sql && (
                      <div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-muted-foreground">SQL Query</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(response.sql as string)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-foreground">{response.sql}</pre>
                      </div>
                    )}
                    {response.table && (
                      <div className="text-left animate-in fade-in duration-300">
                        <div className="text-xs text-muted-foreground mb-2">Data Retrieved</div>
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
                  </div>
                )}

                {response.currentStep === 'explaining' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <FileText className="w-8 h-8 text-orange-500" />
                      <p className="text-sm text-muted-foreground">Generating explanation...</p>
                    </div>
                    {response.identify && (
                      <div className="text-sm text-muted-foreground">
                        Source: <span className="font-medium text-foreground">{response.identify}</span>
                      </div>
                    )}
                    {"sql" in response && response.sql && (
                      <div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-muted-foreground">SQL Query</div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(response.sql as string)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-foreground">{response.sql}</pre>
                      </div>
                    )}
                    {response.table && (
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground mb-2">Results</div>
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
                    {response.explanation && (
                      <div className="text-left text-sm bg-muted/10 rounded-md p-3 animate-in fade-in duration-300">
                        <div className="text-xs text-muted-foreground mb-1">Analysis</div>
                        <p className="text-foreground whitespace-pre-wrap break-words">{response.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {!response.currentStep && (
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                )}
              </div>
            ) : (
              // COMPLETED/ERROR STATE - TABBED LAYOUT
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Error banner if any */}
                {response.status === "error" && response.error && (
                  <div className="text-left text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {response.error}
                  </div>
                )}

                {/* Top meta / metrics row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-left text-sm text-muted-foreground">
                    {response.identify && (
                      <>Identified source: <span className="font-medium text-foreground">{response.identify}</span></>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {typeof metrics.tablesGenerated === 'number' && (
                      <Badge variant="secondary" className="rounded-full">Tables: {metrics.tablesGenerated}</Badge>
                    )}
                    {metrics.duration && (
                      <Badge variant="secondary" className="rounded-full">Duration: {metrics.duration}</Badge>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-2">
                      <Database className="h-4 w-4" /> Table
                    </TabsTrigger>
                    <TabsTrigger value="sql" className="flex items-center gap-2">
                      <Code className="h-4 w-4" /> SQL
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab (Chart + Explanation) */}
                  <TabsContent value="overview" className="mt-4">
                    {/* Chart placeholder */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <div className="h-64 w-full border-2 border-dashed border-muted-foreground/20 rounded-md grid place-items-center">
                        <div className="text-sm text-muted-foreground">
                          Chart will render here
                          <span className="block text-xs">Replace this with your Chart component.</span>
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-left text-sm bg-muted/10 rounded-md p-3 mt-4">
                      <div className="text-xs text-muted-foreground mb-1">Explanation</div>
                      {response.explanation
                        ? <p className="text-foreground whitespace-pre-wrap break-words">{response.explanation}</p>
                        : <p className="text-muted-foreground italic">No explanation generated.</p>}
                    </div>
                  </TabsContent>

                  {/* Table Tab */}
                  <TabsContent value="table" className="mt-4">
                    {response.table ? (
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
                    ) : (
                      <div className="text-sm text-muted-foreground italic">No table results available.</div>
                    )}
                  </TabsContent>

                  {/* SQL Tab */}
                  <TabsContent value="sql" className="mt-4">
                    {"sql" in response ? (
                      <div className="text-left text-sm bg-muted/30 rounded-md p-3 overflow-auto">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-muted-foreground">SQL</div>
                          {response.sql && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(response.sql as string)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap break-words text-foreground">{response.sql ?? "(no SQL generated)"}</pre>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">SQL not available.</div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
