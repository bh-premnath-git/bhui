import { useState, useCallback, useEffect } from 'react';
import { QueryResult, StreamMessage, TableSchema } from '@/types/data-catalog/xplore/type';
import { updateTableSchemas } from './useTableSchemas';

export function useStreamingResponse() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState<string | undefined>(undefined);
  const [streamedData, setStreamedData] = useState<QueryResult[]>([]);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

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

  const resetStream = useCallback(() => {
    setIsStreaming(false);
    setStreamedContent(undefined);
    setStreamedData([]);
    setLastExplanation(null);
  }, []);

  const processStreamMessage = (message: StreamMessage) => {
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
  };

  const startStreaming = useCallback(async (question: string) => {
    setIsStreaming(true);

    // Choose stream based on question content
    let streamToUse;

    if (question.toLowerCase().includes('sales') && question.toLowerCase().includes('compare')) {
      streamToUse = mockMultiSeriesStream;
    } else if (question.toLowerCase().includes('bubble') || question.toLowerCase().includes('scatter')) {
      streamToUse = mockBubbleStream;
    } else {
      streamToUse = mockDefaultStream;
    }

    // Process stream
    try {
      const mockStream = streamToUse();
      for await (const message of mockStream) {
        processStreamMessage(message as StreamMessage);
      }
    } catch (error) {
      console.error('Error in streaming response:', error);
      setIsStreaming(false);
    }
  }, []);

  // Default stream with bar chart
  const mockDefaultStream = async function* () {
    const requestId = crypto.randomUUID();
    
    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'started' as const
      },
      data: {
        message: "Processing has started",
        input_question: "Show me the top 10 most expensive products"
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add IDENTIFY messages to match real stream
    yield {
      response_type: "IDENTIFY" as const,
      content: "public.products",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "SQL" as const,
      content: "SELECT product_name AS product_name, unit_price AS unit_price FROM public.products ORDER BY unit_price DESC LIMIT 10;",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    yield {
      response_type: "TABLE" as const,
      content: {
        table_name: "products",
        column_names: ["product_name", "unit_price"],
        column_values: [
          ["Côte de Blaye", "263.5"],
          ["Thüringer Rostbratwurst", "123.79"],
          ["Mishi Kobe Niku", "97.0"],
          ["Sir Rodney's Marmalade", "81.0"],
          ["Carnarvon Tigers", "62.5"],
          ["Raclette Courdavault", "55.0"],
          ["Manjimup Dried Apples", "53.0"],
          ["Tarte au sucre", "49.3"],
          ["Ipoh Coffee", "46.0"],
          ["Rössle Sauerkraut", "45.6"]
        ]
      },
      timestamp: new Date().toISOString()
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    yield {
      response_type: "CHART" as const,
      content: `{
        "chart_type": "bar",
        "title": "Top 10 Most Expensive Products",
        "description": "A bar chart displaying the top 10 most expensive products based on their unit price.",
        "x_axis": {
          "label": "Product Name",
          "field": "product"
        },
        "y_axis": {
          "label": "Unit Price",
          "field": "price"
        },
        "data": [
          { "product": "Côte de Blaye", "price": 263.5 },
          { "product": "Thüringer Rostbratwurst", "price": 123.79 },
          { "product": "Mishi Kobe Niku", "price": 97.0 },
          { "product": "Sir Rodney's Marmalade", "price": 81.0 },
          { "product": "Carnarvon Tigers", "price": 62.5 },
          { "product": "Raclette Courdavault", "price": 55.0 },
          { "product": "Manjimup Dried Apples", "price": 53.0 },
          { "product": "Tarte au sucre", "price": 49.3 },
          { "product": "Ipoh Coffee", "price": 46.0 },
          { "product": "Rössle Sauerkraut", "price": 45.6 }
        ]
      }`,
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "EXPLANATION" as const,
      content: "The query results show the top 10 most expensive products. The most expensive product is \"Côte de Blaye\" with a unit price of 263.5. The next most expensive are \"Thüringer Rostbratwurst\" at 123.79, and \"Mishi Kobe Niku\" at 97.0. The 10th most expensive product is \"Rössle Sauerkraut\" at 45.6.",
      timestamp: new Date().toISOString()
    };

    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'completed' as const
      },
      data: {
        message: "Processing has completed",
        input_question: "Show me the top 10 most expensive products",
        duration_ms: 5000,
        results_summary: {
          response_type: "CHART"
        }
      }
    };
  };

  // Multi-series chart stream
  const mockMultiSeriesStream = async function* () {
    const requestId = crypto.randomUUID();
    
    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'started' as const
      },
      data: {
        message: "Processing has started",
        input_question: "Compare sales by region and category"
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "IDENTIFY" as const,
      content: "public.sales",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "SQL" as const,
      content: "SELECT category, region, SUM(sales) as total_sales FROM public.sales GROUP BY category, region ORDER BY category, region;",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    yield {
      response_type: "CHART" as const,
      content: `{
        "chart_type": "bar",
        "title": "Sales Comparison by Category and Region",
        "description": "A comparative bar chart showing sales across different product categories and regions.",
        "is_multi_series": true,
        "x_axis": {
          "label": "Category",
          "field": "category"
        },
        "y_axis": {
          "label": "Sales",
          "field": "value"
        },
        "series_data": {
          "North America": [
            { "category": "Electronics", "value": 12500 },
            { "category": "Clothing", "value": 8700 },
            { "category": "Food", "value": 4300 },
            { "category": "Home", "value": 6800 }
          ],
          "Europe": [
            { "category": "Electronics", "value": 9800 },
            { "category": "Clothing", "value": 7600 },
            { "category": "Food", "value": 5100 },
            { "category": "Home", "value": 4900 }
          ],
          "Asia": [
            { "category": "Electronics", "value": 15600 },
            { "category": "Clothing", "value": 6200 },
            { "category": "Food", "value": 3800 },
            { "category": "Home", "value": 5500 }
          ]
        },
        "format": "currency"
      }`,
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "EXPLANATION" as const,
      content: "The chart shows sales comparison across different product categories and regions. Electronics has the highest sales in all regions, with Asia leading at $15,600, followed by North America at $12,500. Food products have the lowest sales across all regions, with Asia showing the smallest amount at $3,800.",
      timestamp: new Date().toISOString()
    };
    
    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'completed' as const
      },
      data: {
        message: "Processing has completed",
        input_question: "Compare sales by region and category",
        duration_ms: 5000,
        results_summary: {
          response_type: "CHART"
        }
      }
    };
  };

  // Bubble chart stream
  const mockBubbleStream = async function* () {
    const requestId = crypto.randomUUID();
    
    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'started' as const
      },
      data: {
        message: "Processing has started",
        input_question: "Show me countries by GDP, population, and area"
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "IDENTIFY" as const,
      content: "public.countries",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "SQL" as const,
      content: "SELECT country, gdp, population, area FROM public.countries ORDER BY gdp DESC;",
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    yield {
      response_type: "CHART" as const,
      content: `{
        "chart_type": "bubble",
        "title": "Countries by GDP, Population, and Land Area",
        "description": "A bubble chart showing countries with GDP on the x-axis, population on the y-axis, and land area as bubble size.",
        "x_axis": {
          "label": "GDP (Billions USD)",
          "field": "gdp"
        },
        "y_axis": {
          "label": "Population (Millions)",
          "field": "population"
        },
        "size_field": "area",
        "data": [
          { "country": "USA", "gdp": 21400, "population": 331, "area": 9833520 },
          { "country": "China", "gdp": 14300, "population": 1400, "area": 9596960 },
          { "country": "Japan", "gdp": 5100, "population": 126, "area": 377975 },
          { "country": "Germany", "gdp": 3800, "population": 83, "area": 357022 },
          { "country": "UK", "gdp": 2700, "population": 67, "area": 242900 },
          { "country": "India", "gdp": 2600, "population": 1380, "area": 3287263 },
          { "country": "France", "gdp": 2600, "population": 65, "area": 551695 },
          { "country": "Italy", "gdp": 1900, "population": 60, "area": 301340 },
          { "country": "Brazil", "gdp": 1800, "population": 212, "area": 8515767 },
          { "country": "Canada", "gdp": 1700, "population": 38, "area": 9984670 }
        ]
      }`,
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    yield {
      response_type: "EXPLANATION" as const,
      content: "This bubble chart visualizes countries by their economic and demographic data. The x-axis shows GDP in billions of USD, the y-axis shows population in millions, and the bubble size represents the country's land area. The USA and China stand out with high GDP, while India has a relatively lower GDP despite its large population. Canada has a large land area but smaller population and moderate GDP.",
      timestamp: new Date().toISOString()
    };
    
    yield {
      meta: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        request_id: requestId,
        status: 'completed' as const
      },
      data: {
        message: "Processing has completed",
        input_question: "Show me countries by GDP, population, and area",
        duration_ms: 5000,
        results_summary: {
          response_type: "CHART"
        }
      }
    };
  };

  return {
    isStreaming,
    streamedContent,
    streamedData,
    startStreaming,
    resetStream,
    lastExplanation,
  };
}