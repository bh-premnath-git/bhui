import { Button } from '@/components/ui/button';
import { Lock, Unlock, RefreshCw, Star, Link } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { toggleGridLock, refreshWidget } from '@/store/slices/dataops/dashboardSlice'
export const DashboardHeader = () => {
  const { widgets, isGridLocked } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();
  const handleRefreshAll = () => {
    Object.keys(widgets).forEach(widgetId => {
      dispatch(refreshWidget(widgetId));
    });
  };
  const handleToggleLock = () => {
    dispatch(toggleGridLock());
  };

  return (
    <div className="flex items-center justify-between p-2 bg-widget-bg border-b border-widget-border">
      <div></div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Star className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshAll}
          className="h-8 px-3"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button
          variant={isGridLocked ? "default" : "ghost"}
          size="sm"
          onClick={handleToggleLock}
          className="h-8 px-3"
        >
          {isGridLocked ? (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Locked
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 mr-1" />
              Unlocked
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

