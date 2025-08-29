import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Database, Code } from 'lucide-react';
import { OverviewTab } from '../tabs/OverviewTab';
import { TableTab } from '../tabs/TableTab';
import { SqlTab } from '../tabs/SqlTab';
import type { TableEvent, SqlEvent, ExplanationEvent } from '@/types/streaming';

interface CompletedAnalysisProps {
  sql?: SqlEvent['content'];
  table?: TableEvent['content'];
  explanation?: ExplanationEvent['content'];
  error?: string;
}

export const CompletedAnalysis: React.FC<CompletedAnalysisProps> = ({
  sql,
  table,
  explanation,
  error
}) => {
  if (error) {
    return (
      <div className="text-left text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 animate-in fade-in duration-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
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

        <TabsContent value="overview" className="mt-4">
          <OverviewTab explanation={explanation} table={table} />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <TableTab table={table} />
        </TabsContent>

        <TabsContent value="sql" className="mt-4">
          <SqlTab sql={sql} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
