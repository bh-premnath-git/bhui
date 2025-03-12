import { useState, useCallback, useEffect } from 'react';
import { QueryResult, StreamMessage, TableSchema } from '@/types/data-catalog/xplore/type';
import { updateTableSchemas } from './useTableSchemas';
import { useXplore } from '@/features/data-catalog/hooks/useXplore';
import { toast } from 'sonner';

export function useStreamingResponse() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState<string | undefined>(undefined);
  const [streamedData, setStreamedData] = useState<QueryResult[]>([]);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [abortStreamingFunction, setAbortStreamingFunction] = useState<(() => void) | null>(null);
  
  const { streamConversation } = useXplore();

  useEffect(() => {
    const schemas: TableSchema[] = [
      {
        name: 'products',
        columns: [
          { name: 'id', type: 'uuid', nullable: false },
          { name: 'product_name', type: 'text', nullable: false },
          { name: 'unit_price', type: 'decimal', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
        ],
      },
    ];
    
    updateTableSchemas(schemas);
  }, []);

  useEffect(() => {
    return () => {
      // Clean up any active stream when component unmounts
      if (abortStreamingFunction) {
        abortStreamingFunction();
      }
    };
  }, [abortStreamingFunction]);

  const resetStream = useCallback(() => {
    // Abort any active stream
    if (abortStreamingFunction) {
      abortStreamingFunction();
      setAbortStreamingFunction(null);
    }
    
    setIsStreaming(false);
    setStreamedContent(undefined);
    setStreamedData([]);
    setLastExplanation(null);
  }, [abortStreamingFunction]);

  const processStreamMessage = useCallback((message: StreamMessage) => {
    if (message.meta) {
      if (message.meta.status === 'started') {
        setStreamedContent('');
        setStreamedData([]);
        setLastExplanation(null);
      } else if (message.meta.status === 'completed') {
        setIsStreaming(false);
      }
      return;
    }

    if (!message.response_type) return;

    switch (message.response_type) {
      case 'IDENTIFY':
        // Skip adding the IDENTIFY messages to the streamed content
        // We still process them but don't show them to the user
        break;

      case 'SQL':
        // Add SQL query to the streamed content
        const sqlQuery = message.content;
        setStreamedContent(prev => {
          if (!prev) return sqlQuery;
          // If we have an explanation, preserve it
          if (lastExplanation) {
            return `${sqlQuery}\n\n${lastExplanation}`;
          }
          return prev + '\n' + sqlQuery;
        });
        break;

      case 'TABLE':
        const tableData = message.content as {
          table_name: string;
          column_names: string[];
          column_values: any[][];
        };

        const formattedTableData = tableData.column_values.map(row => 
          Object.fromEntries(
            tableData.column_names.map((col, i) => [col, row[i]])
          )
        );

        setStreamedData(prev => [...prev, {
          type: 'table',
          columns: tableData.column_names,
          data: formattedTableData
        }]);
        break;

      case 'CHART':
        try {
          const chartContent = JSON.parse(message.content.replace(/```json\n|\n```/g, ''));
          
          // Extract x and y-axis field names from the data structure
          const xAxisField = chartContent.x_axis?.field || 'product';
          const yAxisField = chartContent.y_axis?.field || 'price';
          const sizeField = chartContent.size_field || 'size';
          
          // Extract axis labels if available
          const xAxisLabel = chartContent.x_axis?.label;
          const yAxisLabel = chartContent.y_axis?.label;
          
          // Determine if this is multi-series data
          const isMultiSeries = chartContent.is_multi_series || false;
          
          // Process data according to chart format
          let chartData;
          
          if (isMultiSeries && chartContent.series_data) {
            // Handle multi-series data format
            chartData = chartContent.series_data;
          } else {
            // Use original data format but preserve all fields
            chartData = chartContent.data;
          }

          setStreamedData(prev => [...prev, {
            type: 'chart',
            data: chartData,
            title: chartContent.title,
            xAxis: xAxisField,
            yAxis: yAxisField,
            xAxisLabel: xAxisLabel,
            yAxisLabel: yAxisLabel,
            sizeKey: sizeField,
            isMultiSeries: isMultiSeries,
            chartType: chartContent.chart_type,
            format: chartContent.format || 'number'
          }]);
        } catch (error) {
          console.error('Error parsing chart data:', error);
        }
        break;

      case 'EXPLANATION':
        // Store the explanation separately and append to streamed content
        setLastExplanation(message.content);
        setStreamedContent(prev => {
          if (!prev) return message.content;
          // If we have SQL content, append the explanation after it
          if (prev.includes('SELECT') || prev.includes('INSERT') || prev.includes('UPDATE')) {
            return prev + '\n\n' + message.content;
          }
          // Otherwise, this is a new explanation
          return message.content;
        });
        break;
    }
  }, [lastExplanation]);

  const startStreaming = useCallback(async (question: string, connectionId: string, threadId: string) => {
    // Reset current stream before starting a new one
    if (abortStreamingFunction) {
      abortStreamingFunction();
      setAbortStreamingFunction(null);
    }

    if (!connectionId) {
      toast.error("No connection selected. Please select a connection first.");
      return;
    }

    if (!threadId) {
      toast.error("No active conversation. Please start a new chat.");
      return;
    }

    setIsStreaming(true);

    try {
      console.log(`Starting stream with question: "${question}", connectionId: ${connectionId}, threadId: ${threadId}`);
      const parsedConnectionId = parseInt(connectionId, 10);
      
      if (isNaN(parsedConnectionId)) {
        throw new Error(`Invalid connection ID: ${connectionId}`);
      }
      
      const abortFunction = streamConversation(
        parsedConnectionId,
        question,
        threadId,
        (jsonString: string) => {
          try {
            console.log("Received stream chunk:", jsonString.substring(0, 100) + (jsonString.length > 100 ? "..." : ""));
            const messageData = JSON.parse(jsonString);
            console.log("Parsed message type:", messageData.response_type || (messageData.meta ? "meta" : "unknown"));
            processStreamMessage(messageData as StreamMessage);
          } catch (error) {
            console.error('Error parsing stream message:', error, jsonString);
          }
        },
        () => {
          console.log("Stream completed");
          setIsStreaming(false);
          setAbortStreamingFunction(null);
        },
        (error) => {
          console.error('Stream error:', error);
          toast.error('Error while processing your question');
          setIsStreaming(false);
          setAbortStreamingFunction(null);
        }
      );
      
      setAbortStreamingFunction(() => abortFunction);
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start conversation stream');
      setIsStreaming(false);
    }
  }, [streamConversation, processStreamMessage, abortStreamingFunction]);

  return {
    isStreaming,
    streamedContent,
    streamedData,
    startStreaming,
    resetStream,
    lastExplanation,
  };
}