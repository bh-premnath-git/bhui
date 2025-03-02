import { useState } from "react";
import XplorePanel from "./XplorePanel";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";

export default function Xplorer() {
  const [showSidebar, setShowSidebar] = useState(true);
  
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-2 flex items-center justify-between">
        <h1 className="text-xl font-bold px-2">Data Explorer</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowSidebar(!showSidebar)}
          className="ml-auto"
        >
          <PanelRight className={`h-5 w-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <XplorePanel showSidebar={showSidebar} />
      </div>
    </div>
  );
} 