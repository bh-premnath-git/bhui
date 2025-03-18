import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import XplorePanel from "./Xplore/XplorePanel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Xplorer() {
  const [showSidebar, setShowSidebar] = useState(true);
  
  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={30}>
            <XplorePanel showSidebar={showSidebar} />
          </ResizablePanel>
          
          {showSidebar && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full border-l p-4 overflow-auto">
                  {/* Future implementation: Data dictionary, metadata, or other contextual information */}
                  <div className="text-lg font-medium mb-4">Data Context</div>
                  <p className="text-muted-foreground">
                    This panel could display metadata about the selected data sources,
                    column descriptions, or relevant business context.
                  </p>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
} 