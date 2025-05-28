import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Code, BarChart4, Table as TableIcon, FileText } from 'lucide-react';
import { ChatSQLView } from '@/components/shared/chat-components/ChatSQLView';
import { ChatChartView } from '@/components/shared/chat-components/ChatChartView';
import { ChatTableView } from '@/components/shared/chat-components/ChatTableView';

interface AIDataVisualizerProps {
  sql?: any;
  data?: any;
  chart?: any;
  title?: string;
  onAddToDashboard?: (data: any) => void;
}

export function AIDataVisualizer({
  sql,
  data,
  chart,
  title = 'Visualized Data',
  onAddToDashboard,
}: AIDataVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'sql' | 'explanation'>('table');
  const [parsedChartData, setParsedChartData] = useState<any>(null);
  const [formattedTableData, setFormattedTableData] = useState<any[]>([]);
  
  // Parse chart data if it's a string containing JSON
  useEffect(() => {
    if (chart?.content) {
      try {
        // Check if it's a string with JSON inside markdown code blocks
        if (typeof chart.content === 'string' && chart.content.includes('```json')) {
          const jsonContent = chart.content.replace(/```json\n|\n```/g, '');
          const parsed = JSON.parse(jsonContent);
          
          // Extract the graph data which is what the ChartView expects
          if (parsed.graph_data) {
            setParsedChartData(parsed.graph_data);
          }
        } else {
          // It's already a parsed object
          setParsedChartData(chart.content);
        }
      } catch (error) {
        console.error("Error parsing chart data:", error);
      }
    }
  }, [chart]);
  
  // Format table data from column-based to row-based objects
  useEffect(() => {
    if (data?.content?.column_names && data?.content?.column_values) {
      const columnNames = data.content.column_names;
      const rows = data.content.column_values;
      
      const formatted = rows.map((row: any[]) => {
        const rowObj: Record<string, any> = {};
        columnNames.forEach((colName: string, index: number) => {
          rowObj[colName] = row[index];
        });
        return rowObj;
      });
      
      setFormattedTableData(formatted);
    }
  }, [data]);
  
  if (!sql && !data && !chart) return null;
  
  return (
    <motion.div
      className="mt-6 rounded-xl border bg-card shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="flex items-center space-x-2">
            <TabsList className="h-8 p-1">
              {data && (
                <TabsTrigger value="table" className="h-6 px-2 text-xs">
                  <TableIcon className="h-3.5 w-3.5 mr-1" />
                  Table
                </TabsTrigger>
              )}
              {chart && (
                <TabsTrigger value="chart" className="h-6 px-2 text-xs">
                  <BarChart4 className="h-3.5 w-3.5 mr-1" />
                  Chart
                </TabsTrigger>
              )}
              {sql && (
                <TabsTrigger value="sql" className="h-6 px-2 text-xs">
                  <Code className="h-3.5 w-3.5 mr-1" />
                  SQL
                </TabsTrigger>
              )}
            </TabsList>
            
            {onAddToDashboard && parsedChartData && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddToDashboard(parsedChartData)}
                className="h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {data && (
            <TabsContent value="table" className="p-4">
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatTableView data={formattedTableData} />
              </motion.div>
            </TabsContent>
          )}
          
          {chart && (
            <TabsContent value="chart" className="p-4">
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {parsedChartData && <ChatChartView data={parsedChartData} />}
              </motion.div>
            </TabsContent>
          )}
          
          {sql && (
            <TabsContent value="sql" className="p-4">
              <motion.div
                key="sql"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatSQLView sql={sql.content} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}