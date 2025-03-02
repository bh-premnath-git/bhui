import { useState } from "react";
import XplorePanel from "./components/Xplore/XplorePanel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Xplorer() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 overflow-hidden">
        <XplorePanel />
      </main>
    </div>
  );
}
