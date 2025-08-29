import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  PlusCircle, 
  Database, 
  Share,
  BarChart4, 
  Clock, 
  Star,
  Filter,
  GitBranch
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFlow } from '@/context/designers/FlowContext';
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { CreateFlowDialog } from '../flow/components/CreateFlowDialog';

interface FlowSidebarProps {
  className?: string;
}

interface Flow {
  flow_id: number;
  flow_name: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  description?: string;
}

const FlowSidebar: React.FC<FlowSidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { setSelectedFlowId } = useFlow();
  const { fetchFlowsList } = useFlowApi();
  
  const [selectedFlowId, setSelectedFlowIdLocal] = useState<string | null>(id || null);
const {
    data: initialFlows,
    isLoading,
    isFetching,
    isError,
    refetch: refetchAllFlows
  }:any = fetchFlowsList(1, 1000, true); // Fetch with a large limit to get all flows
  
  // Extract flow data from the response
  const flowData = useMemo(() => {
    if (!initialFlows) return [];
    
    if (Array.isArray(initialFlows)) {
      return initialFlows;
    } else if (initialFlows.data && Array.isArray(initialFlows.data)) {
      return initialFlows.data;
    }
    
    return [];
  }, [initialFlows]); 
  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteFlows');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteFlows', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = (e: React.MouseEvent, flowId: number) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(flowId)) {
        return prev.filter(id => id !== flowId);
      } else {
        return [...prev, flowId];
      }
    });
  };

  // Filter flows based on search term and active tab
  const filteredFlows = flowData.filter(flow => {
    const matchesSearch = flow.flow_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'favorites') {
      return matchesSearch && favorites.includes(flow.flow_id);
    }
    
    if (activeTab === 'recent') {
      // For demo purposes, we'll just show all flows in recent
      // In a real app, you'd track recently accessed flows
      return matchesSearch;
    }
    
    return matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };



  // Track if navigation is in progress to prevent loops
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Handle flow selection
  const handleFlowSelect = async (flowId: number) => {
    const flowIdStr = flowId.toString();
    
    // Don't do anything if we're already on this flow or if navigation is in progress
    if (selectedFlowId === flowIdStr || isNavigating) {
      return;
    }
    
    console.log(`FlowSidebar: Selecting flow ${flowIdStr}`);
    
    // Set navigating flag to prevent loops
    setIsNavigating(true);
    
    // Update local state
    setSelectedFlowIdLocal(flowIdStr);
    
    // Store in localStorage for persistence
    localStorage.setItem("flow_id", flowIdStr);
    
    // Update the FlowContext
    setSelectedFlowId(flowIdStr);

    try {
      // Check if we're already on the correct route
      const targetRoute = ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(flowIdStr);
      const currentRoute = location.pathname;
      
      // If we're already on the correct route, just update the URL
      if (currentRoute.includes('/designers/data-flow-playground/')) {
        // Navigate with replace to update URL without adding to history
        navigate(targetRoute, { replace: true });
        
        // Manually trigger a refetch of the flow data
        // This is done by dispatching a custom event that DataFlow will listen for
        const flowSelectedEvent = new CustomEvent('flowSelected', {
          detail: { flowId: flowIdStr }
        });
        document.dispatchEvent(flowSelectedEvent);
        
        // Reset navigation flag after a delay
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      } else {
        // Otherwise, navigate to the new route
        navigate(targetRoute);
        
        // Reset navigation flag after a delay
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      }
    } catch (error) {
      console.error('Error navigating to flow:', error);
      setIsNavigating(false);
    }
  };

  // Update selected flow ID when URL param changes
  useEffect(() => {
    // Skip if navigation is in progress or if ID hasn't changed
    if (isNavigating || !id || id === selectedFlowId) {
      return;
    }
    
    console.log(`FlowSidebar: URL param changed to flow ID ${id}`);
    
    // Update local state
    setSelectedFlowIdLocal(id);
    
    // Update FlowContext
    setSelectedFlowId(id);
    
    // Store in localStorage
    localStorage.setItem("flow_id", id);
    
    // Dispatch event to notify DataFlow component
    const flowSelectedEvent = new CustomEvent('flowSelected', {
      detail: { flowId: id }
    });
    document.dispatchEvent(flowSelectedEvent);
  }, [id, selectedFlowId, setSelectedFlowId, isNavigating]);
  
  // Auto-select first flow if flowData is not empty and no flow is currently selected
  useEffect(() => {
    // Only proceed if we have flows, no flow is selected, and we're not currently navigating
    if (flowData.length > 0 && !selectedFlowId && !isNavigating && !isLoading) {
      const firstFlow = flowData[0];
      console.log(`FlowSidebar: Auto-selecting first flow ${firstFlow.flow_id}`);
      handleFlowSelect(firstFlow.flow_id);
    }
  }, [flowData, selectedFlowId, isNavigating, isLoading]);

  

  return (
    <>
      <div
       className={cn(
                 "h-full bg-background border-r transition-all duration-300 flex flex-col pipeline-sidebar",
                 isOpen ? "pipeline-sidebar-expanded" : "pipeline-sidebar-collapsed",
                 className
               )}
        
      >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-3 mt-3 border-b">
        {isOpen && (
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-primary" />
            <h3 className="font-medium text-sm">Data Flows</h3>
          </div>
        )}
        <div className="flex items-center gap-1">
          {isOpen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCreateDialogOpen(true)}
                    className="h-7 w-7 text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <PlusCircle size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new flow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent side={isOpen ? "right" : "right"}>
                <p>{isOpen ? "Collapse sidebar" : "Expand sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Only show these sections when sidebar is expanded */}
      {isOpen && (
        <>
          {/* Search input */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Tabs for filtering */}
          <div className="px-2 pt-2">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs">Favorites</TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </>
      )}

      {/* Flow list */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isOpen ? (
          filteredFlows.length > 0 ? (
            <ul className="py-2">
              {filteredFlows.map((flow) => (
                <li key={flow.flow_id} className="px-2">
                  <div
                    onClick={() => handleFlowSelect(flow.flow_id)}
                    className={cn(
                      "w-full rounded-md px-2 py-2 text-sm hover:bg-muted transition-colors cursor-pointer",
                      "flex flex-col gap-1",
                      selectedFlowId === flow.flow_id.toString() && "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    )}
                    title={flow.flow_name}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch size={14} className="flex-shrink-0" />
                        <span className="truncate font-medium">{flow.flow_name}</span>
                      </div>
                      <button 
                        onClick={(e) => toggleFavorite(e, flow.flow_id)}
                        className={cn(
                          "h-6 w-6 flex items-center justify-center rounded-full",
                          favorites.includes(flow.flow_id) 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Star size={14} fill={favorites.includes(flow.flow_id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Updated {formatDate(flow.updated_at)}</span>
                      </div>
                      {flow.status && (
                        <Badge 
                          variant={flow.status === 'active' ? "default" : "outline"}
                          className="text-[10px] h-5"
                        >
                          {flow.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              <div className="flex flex-col items-center gap-2 mt-8">
                <Filter size={24} className="text-muted-foreground/50" />
                <p>No flows found</p>
                {activeTab === 'all' && flowData.length === 0 ? (
                  <>
                    <p className="text-xs mb-3">Get started by creating a new flow</p>
                    <Button 
                      onClick={() => setCreateDialogOpen(true)}
                      size="sm"
                      className="mt-2"
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Create Flow
                    </Button>
                  </>
                ) : (
                  <p className="text-xs">Try adjusting your search or filters</p>
                )}
              </div>
            </div>
          )
        ) : (
          // When sidebar is collapsed, show dots for each flow
          <div className="flex flex-col items-center py-2">
            {filteredFlows.slice(0, 10).map((flow) => (
              <TooltipProvider key={flow.flow_id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleFlowSelect(flow.flow_id)}
                      className={cn(
                        "w-6 h-6 rounded-full my-1 flex items-center justify-center",
                        selectedFlowId === flow.flow_id.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <span className="sr-only">{flow.flow_name}</span>
                      {flow.flow_name.charAt(0).toUpperCase()}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{flow.flow_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(flow.updated_at)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {filteredFlows.length > 10 && (
              <div className="text-xs text-muted-foreground mt-2">
                +{filteredFlows.length - 10} more
              </div>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCreateDialogOpen(true)}
                    className="h-6 w-6 rounded-full mt-3 text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <PlusCircle size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Create new flow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      </div>
      
      {/* Create Flow Dialog */}
      <CreateFlowDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
};

export default FlowSidebar;