import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useDashboardSelector } from '@/hooks/useDashboardSelector';

interface DashboardSelectProps {
  onSelectDashboard: (dashboardId: string) => void;
  selectedDashboardId: string | null;
}

export function DashboardSelect({ onSelectDashboard, selectedDashboardId }: DashboardSelectProps) {
  const {
    searchTerm,
    setSearchTerm,
    filteredDashboards,
    isLoading,
    isError
  } = useDashboardSelector();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-gray-500">Loading dashboards...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500 text-sm">
        <div className="flex flex-col items-center">
          <div>Failed to load dashboards.</div>
          <button 
            onClick={() => onSelectDashboard(undefined)}
            className="mt-2 px-4 py-1 bg-primary/10 text-primary text-sm rounded-md hover:bg-primary/20"
          >
            Use Main Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Input
        placeholder="Search dashboards..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2 h-8 text-sm"
      />
      <ScrollArea className="h-[80px] border rounded-md p-2">
        {filteredDashboards.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-4">
            No dashboards found.
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredDashboards.map((dashboard) => (
              <li key={dashboard.id}>
                <button
                  onClick={() => onSelectDashboard(dashboard.id)}
                  className={cn(
                    "flex items-center justify-between w-full p-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                    selectedDashboardId === dashboard.id && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <span className="truncate">{dashboard.name}</span>
                  {selectedDashboardId === dashboard.id && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
