import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Paintbrush, Database } from "lucide-react";
import AIChat from "./AIChat";
import SQLViewer from "./SQLViewer";
import StyleEditor from "./StyleEditor";

export default function ToolsPanel() {
  return (
    <Tabs defaultValue="ai" className="w-full h-full">
      <TabsList className="w-full justify-start p-0 h-12 rounded-none border-b">
        <TabsTrigger value="ai" className="flex gap-2 data-[state=active]:bg-accent">
          <MessageSquare className="h-4 w-4" />
          Bighammer AI
        </TabsTrigger>
        <TabsTrigger value="styling" className="flex gap-2">
          <Paintbrush className="h-4 w-4" />
          Styling
        </TabsTrigger>
        <TabsTrigger value="sql" className="flex gap-2">
          <Database className="h-4 w-4" />
          SQL
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ai" className="m-0 p-4">
        <AIChat />
      </TabsContent>
      <TabsContent value="styling" className="m-0 p-4">
        <StyleEditor />
      </TabsContent>
      <TabsContent value="sql" className="m-0 p-4">
        <SQLViewer />
      </TabsContent>
    </Tabs>
  );
}