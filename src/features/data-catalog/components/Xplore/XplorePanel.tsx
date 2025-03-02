import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";
import AnalyticsPanel from "./AnalyticsPanel";
import { MessageSquare, Database, Paintbrush } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";

export default function XplorePanel() {
  const [activeTab, setActiveTab] = useState<string>("bighammer");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const { messages } = useChatMessages();

  return (
    <div className="flex h-full">
      {/* Main content area - always visible */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'border-r' : ''}`}>
        {/* Make the content area scrollable but keep the chat input fixed */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 pb-20"> {/* Add padding at the bottom to ensure content isn't hidden behind the chat input */}
            {messages.length > 0 ? (
              <div className="space-y-4">
                {/* Current conversation */}
                <div className="space-y-3">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "assistant"
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <AnalyticsPanel />
            )}
          </div>
        </div>
        
        {/* Chat input area - fixed at bottom */}
        <div className="p-4 border-t bg-background sticky bottom-0 z-10 shadow-md">
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
              <AIChat showHistory={true} />
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