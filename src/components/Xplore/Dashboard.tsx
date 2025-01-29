import AnalyticsPanel from "./AnalyticsPanel";
import ToolsPanel from "./ToolsPanel";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 p-2 ml-8 border-r">
        <AnalyticsPanel />
      </div>
      <div className="w-[450px]">
        <ToolsPanel />
      </div>
    </div>
  );
}