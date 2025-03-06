import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { AIStreamingResponse, ResponseType } from './utils';

export interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface ResponseDisplayProps {
  data?: AIStreamingResponse[];
  className?: string;
  isStreaming?: boolean;
  messages: Message[];
}

export default function ResponseDisplay({ data = [], className = '', isStreaming = false, messages }: ResponseDisplayProps) {
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Group responses by type
  const organizedResponses = useMemo(() => {
    // Skip empty data
    if (!data || data.length === 0) {
      return {} as Record<ResponseType, AIStreamingResponse | undefined>;
    }
    
    const result: Record<ResponseType, AIStreamingResponse | undefined> = {
      EXPLANATION: undefined,
      SQL: undefined,
      TABLE: undefined,
      CHART: undefined,
      IDENTIFY: undefined
    };
    
    // Get the latest of each type
    data.forEach(response => {
      if (response && response.response_type) {
        result[response.response_type] = response;
      }
    });
    
    return result;
  }, [data]);
  
  // Extract content for each type
  const explanationContent = organizedResponses.EXPLANATION?.content || '';
  const sqlContent = organizedResponses.SQL?.content || '';
  const tableContent = organizedResponses.TABLE?.content;
  const chartContent = organizedResponses.CHART?.content;
  
  // Function to copy SQL to clipboard
  const handleCopySql = () => {
    if (sqlContent) {
      navigator.clipboard.writeText(typeof sqlContent === 'string' ? sqlContent : JSON.stringify(sqlContent));
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };
  
  // Render the chat messages
  const renderChatMessages = () => {
    if (!messages || messages.length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-4 mb-4">
        {messages.map((message, i) => (
          <div
            key={`chat-msg-${i}`}
            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "assistant"
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
                }`}
            >
              {message.role === 'assistant' && (!message.content || message.content.trim() === '') && isStreaming
                ? <span className="animate-pulse">Thinking...</span>
                : (
                  <div className="whitespace-pre-line">
                    {message.content || ""}
                  </div>
                )
              }
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // If there's no data but we're streaming, show loading state
  if (!data || data.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {renderChatMessages()}
        
        {isStreaming && (
          <div className="rounded-lg overflow-hidden border bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Building visualization...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const hasMultipleViews = sqlContent || tableContent || chartContent;

  return (
    <div className={`space-y-4 ${className}`}>
      {renderChatMessages()}
      
      <div className="rounded-lg overflow-hidden border bg-background">
        {explanationContent && (
          <div className="p-4 border-b">
            <p className="text-sm whitespace-pre-line">{explanationContent}</p>
          </div>
        )}

        {isStreaming && !hasMultipleViews && (
          <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing data...</span>
          </div>
        )}

        {hasMultipleViews && (
          <Tabs defaultValue="insights" className="w-full">
            <div className="border-b px-3">
              <TabsList className="h-9">
                <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
                {chartContent && <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>}
                {tableContent && <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>}
              </TabsList>
            </div>

            <TabsContent value="insights" className="p-4">
              {explanationContent ? (
                <p className="text-sm whitespace-pre-line">{explanationContent}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No insights available.</p>
              )}
              {sqlContent && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">SQL Query</h4>
                    <button 
                      onClick={handleCopySql}
                      className="flex items-center text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="h-3 w-3 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                    {typeof sqlContent === 'string' ? sqlContent : JSON.stringify(sqlContent, null, 2)}
                  </pre>
                </div>
              )}
              {isStreaming && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing additional insights...</span>
                </div>
              )}
            </TabsContent>

            {chartContent && (
              <TabsContent value="chart" className="p-4">
                <div className="h-64 w-full">
                  {/* Chart implementation would go here */}
                  <div className="flex items-center justify-center h-full bg-muted rounded-md text-muted-foreground">
                    {typeof chartContent === 'object' ? (
                      <div className="p-4 w-full">
                        <h3 className="text-sm font-medium mb-2">{chartContent.title || 'Chart Visualization'}</h3>
                        {chartContent.description && (
                          <p className="text-xs mb-4">{chartContent.description}</p>
                        )}
                        <pre className="text-xs overflow-x-auto max-h-40">
                          {JSON.stringify(chartContent, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center flex-col p-4">
                        <AlertCircle className="h-6 w-6 mb-2" />
                        <p className="text-sm">Chart data format not recognized</p>
                        <p className="text-xs mt-2">{String(chartContent)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {isStreaming && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Optimizing visualization...</span>
                  </div>
                )}
              </TabsContent>
            )}

            {tableContent && (
              <TabsContent value="table" className="p-4">
                <div className="overflow-x-auto">
                  {typeof tableContent === 'object' && tableContent.table_name && tableContent.column_names ? (
                    <div>
                      <h3 className="text-sm font-medium mb-2">{tableContent.table_name}</h3>
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            {tableContent.column_names.map((col: string, i: number) => (
                              <th key={i} className="text-left p-2 font-medium border border-border">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableContent.rows && tableContent.rows.map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="p-2 border border-border">{cell !== null && cell !== undefined ? String(cell) : ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-xs p-4 bg-muted rounded-md">
                      <div className="flex items-center mb-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Table data format not recognized</span>
                      </div>
                      <pre className="whitespace-pre-wrap mt-2">
                        {typeof tableContent === 'string' 
                          ? tableContent 
                          : JSON.stringify(tableContent, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                {isStreaming && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading additional data...</span>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}

        <div className="px-4 py-2 border-t bg-muted/50">
          <button
            onClick={() => setShowRawResponse(!showRawResponse)}
            className="flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            {showRawResponse ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" /> Hide raw response
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" /> Show raw response
              </>
            )}
          </button>
          
          {showRawResponse && (
            <div className="mt-2 bg-muted p-3 rounded-md">
              <pre className="text-xs overflow-x-auto max-h-64 whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
