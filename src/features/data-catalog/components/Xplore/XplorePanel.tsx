import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import AnalyticsPanel from "./AnalyticsPanel";
import { MessageSquare, Database, Paintbrush } from "lucide-react";

export default function XplorePanel() {
  const [activeTab, setActiveTab] = useState<string>("bighammer");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  return (
    <div className="flex h-full">
      {/* Main content area - always visible */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'border-r' : ''}`}>
        <div className="flex-1 p-4 overflow-auto">
          <AnalyticsPanel />
        </div>
        
        {/* Chat input area - always visible at bottom */}
        <div className="p-4 border-t">
          <AIChat compact={true} />
        </div>
      </div>

      {/* Sidebar for tools - can be toggled */}
      {showSidebar && (
        <div className="w-96 border-l">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start p-0 h-12 rounded-none border-b">
              <TabsTrigger value="bighammer">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>BigHammer AI</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="styling">
                <div className="flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  <span>Styling</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="sql">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>SQL</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bighammer" className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Chat History</h3>
                <AIChat showHistory={true} />
              </div>
            </TabsContent>
            
            <TabsContent value="styling" className="flex-1 p-4 overflow-auto">
              <StyleEditor />
            </TabsContent>
            
            <TabsContent value="sql" className="flex-1 p-4 overflow-auto">
              <SQLViewer />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 