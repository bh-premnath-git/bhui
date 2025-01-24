import AnalyticsPanel from "./AnalyticsPanel";
import ToolsPanel from "./ToolsPanel";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen p-6 bg-background">
      <div className="flex-1 p-6 border-r">
        <AnalyticsPanel />
      </div>
      <div className="w-[400px]">
        <ToolsPanel />
      </div>
    </div>
  );
}