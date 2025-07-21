import { useState } from 'react';
import { withPageErrorBoundary } from '@/components/withPageErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PredefinedRecognizers } from '@/features/admin/pii/PredefinedRecognizers';
import { CustomRecognizers } from '@/features/admin/pii/CustomRecognizers';
import { CreateRecognizer } from '@/features/admin/pii/CreateRecognizer';
import { TestValidate } from '@/features/admin/pii/TestValidate';
import { Shield, Settings, Plus, TestTube } from 'lucide-react';

function ManagePII() {
  const [activeTab, setActiveTab] = useState('predefined');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Manage PII</h1>
          </div>
          <p className="text-muted-foreground">
            Configure and manage Personal Identifiable Information (PII) recognizers and patterns
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predefined" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Predefined
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test & Validate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="mt-6">
            <PredefinedRecognizers />
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <CustomRecognizers />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <CreateRecognizer />
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <TestValidate />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withPageErrorBoundary(ManagePII, 'ManagePII');