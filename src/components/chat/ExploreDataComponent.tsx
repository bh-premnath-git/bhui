import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Loader2, Brain, Search, Code, Database, FileText, AlertCircle } from 'lucide-react';
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
            onChunk,       // now typed
            onComplete,
            onError
        );

        return () => {
            try { streamAbortRef.current?.(); } catch { /* no-op */ }
            streamAbortRef.current = null;
        };
    }, [connection?.id, query, threadId, streamConversation]);

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

                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
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
                                    Query Analysis
                                </span>
                            )}
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
                                                <div className="text-xs text-muted-foreground mb-1">Generated SQL</div>
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
                                                <div className="text-xs text-muted-foreground mb-1">SQL Query</div>
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
                                                <div className="text-xs text-muted-foreground mb-1">SQL Query</div>
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
                            // COMPLETED/ERROR STATE - Show all results
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
