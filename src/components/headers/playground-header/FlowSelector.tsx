import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  ChevronDown, 
  PlusCircle, 
  Search, 
  Star, 
  Clock, 
  GitBranch,
  Check,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setSelectedFlow } from '@/store/slices/designer/flowSlice';
import { setIsRightAsideComponent } from '@/store/slices/chat/chatSlice';
import { useFlow } from '@/context/designers/FlowContext';
import { useFlow as useFlowApi } from '@/features/designers/flow/hooks/useFlow';
import { CreateFlowDialog } from '@/features/designers/flow/components/CreateFlowDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useDeleteFlow } from '@/hooks/useDeleteFlow';

const isValidFlowId = (flowId: number | string | null | undefined): boolean => {
  if (typeof flowId === 'number') {
    return flowId > 0;
  }
  if (typeof flowId === 'string') {
    const numId = parseInt(flowId, 10);
    return !isNaN(numId) && numId > 0;
  }
  return false;
};

interface Flow {
  flow_id: number;
  flow_name: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  description?: string;
}

interface FlowSelectorProps {
  initialName: string;
  onSave: (newName: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export const FlowSelector: React.FC<FlowSelectorProps> = ({
  initialName,
  onSave,
  placeholder = 'Select flow...',
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(initialName);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const { setSelectedFlowId } = useFlow();
  const { fetchFlowsList } = useFlowApi();
  const deleteFlowMutation = useDeleteFlow();

  // Use the hook to get flows data
  const {
    data: initialFlows,
    isLoading: flowsLoading,
    refetch: refetchFlows
  }:any = fetchFlowsList(1, 1000, true);

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

  useEffect(() => {
    setTempName(initialName);
  }, [initialName]);

  // Process flows data from the hook
  useEffect(() => {
    if (!initialFlows) {
      setFlows([]);
      return;
    }

    let flowData = [];
    
    if (Array.isArray(initialFlows)) {
      flowData = initialFlows;
    } else if (initialFlows.data && Array.isArray(initialFlows.data)) {
      flowData = initialFlows.data;
    }
    console.log("FlowSelector: Initial flows data", flowData);
    dispatch(setSelectedFlow(flowData[0] || null));
    // Enhance flows with mock data if needed
    const enhancedFlows = flowData.map((flow: Flow) => ({
      ...flow,
      created_at: flow.created_at || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updated_at: flow.updated_at || new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      status: flow.status || Math.random() > 0.7 ? 'active' : 'draft'
    }));
    
    setFlows(enhancedFlows);

  }, [initialFlows]);

  // Fetch flow list
  const fetchFlowList = async () => {
    setIsLoading(true);
    try {
      await refetchFlows();
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle delete flow
  const handleDeleteClick = (e: React.MouseEvent, flow: Flow) => {
    e.stopPropagation();
    setFlowToDelete(flow);
    setDeleteDialogOpen(true);
    setOpen(false); // Close the popover
  };

  const handleDeleteConfirm = () => {
    if (flowToDelete && isValidFlowId(flowToDelete.flow_id)) {
      deleteFlowMutation.mutate(flowToDelete.flow_id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setFlowToDelete(null);
          
          // Check if we're deleting the currently selected flow
          if (isValidFlowId(id) && id === flowToDelete.flow_id.toString()) {
            // Navigate to dashboard
            navigate(ROUTES.DASHBOARD);
          }
          
          // Refresh the flows list
          refetchFlows();
        },
        onError: (error) => {
          console.error('Delete failed:', error);
          // Dialog stays open on error so user can try again
        }
      });
    } else if (flowToDelete && !isValidFlowId(flowToDelete.flow_id)) {
      console.error('FlowSelector: Cannot delete flow with invalid ID', { flowId: flowToDelete.flow_id });
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
    }
  };


  // Handle flow selection
  const handleFlowSelect = async (flow: Flow) => {
    // Validate flow ID before proceeding
    if (!isValidFlowId(flow.flow_id)) {
      console.error('FlowSelector: Cannot select flow with invalid ID', { flowId: flow.flow_id });
      setOpen(false);
      return;
    }

    const flowIdStr = flow.flow_id.toString();
    
    // Don't do anything if we're already on this flow or if navigation is in progress
    if (id === flowIdStr || isNavigating) {
      setOpen(false);
      return;
    }
    
    console.log(`FlowSelector: Selecting flow ${flowIdStr}`);
    
    // Set navigating flag to prevent loops
    setIsNavigating(true);
    
    // Store in localStorage for persistence
    localStorage.setItem("flow_id", flowIdStr);
    
    // Close right aside component when navigating to a different flow
    dispatch(setIsRightAsideComponent(false));
    
    // Update the FlowContext
    setSelectedFlowId(flowIdStr);
    dispatch(setSelectedFlow(flow));
    
    // Update Redux store

    try {
      // Navigate to the new flow
      const targetRoute = ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(flowIdStr);
      const currentRoute = location.pathname;
      
      if (currentRoute.includes('/designers/data-flow-playground/')) {
        // Navigate with replace to update URL without adding to history
        navigate(targetRoute, { replace: true });
        
        // Manually trigger a refetch of the flow data
        const flowSelectedEvent = new CustomEvent('flowSelected', {
          detail: { flowId: flowIdStr }
        });
        document.dispatchEvent(flowSelectedEvent);
      } else {
        // Otherwise, navigate to the new route
        navigate(targetRoute);
      }
      
      // Reset navigation flag after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    } catch (error) {
      console.error('Error navigating to flow:', error);
      setIsNavigating(false);
    }
    
    setOpen(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
    setErrorMessage('');
  };

  const handleRename = async () => {
    try {
      if (tempName !== initialName && tempName.trim()) {
        await onSave(tempName);
      }
      setIsEditing(false);
    } catch (error) {
      setErrorMessage('Failed to update name');
      console.error('Error updating name:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && flows.length === 0 && !flowsLoading) {
      fetchFlowList();
    }
    setOpen(newOpen);
  };

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

  // Filter flows based on search term
  const filteredFlows = flows.filter(flow =>
    flow.flow_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate favorites and regular flows
  const favoriteFlows = filteredFlows.filter(f => favorites.includes(f.flow_id));
  const regularFlows = filteredFlows.filter(f => !favorites.includes(f.flow_id));

  const currentFlow = flows.find(f => f.flow_id.toString() === id);

  return (
    <>
      <div className={cn("relative flex items-center", className)}>
        {isEditing ? (
          <>
            <Input
              type="text"
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                } else if (e.key === 'Escape') {
                  setTempName(initialName);
                  setIsEditing(false);
                }
              }}
              className="h-9 min-w-[200px]"
              autoFocus
              aria-label="Edit flow name"
            />
            {errorMessage && (
              <div className="text-red-500 text-sm mt-1 absolute top-full left-0 z-10">
                {errorMessage}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between min-w-[200px] h-9"
                >
                  <div className="flex items-center gap-2 truncate">
                    <GitBranch size={14} />
                    <span className="truncate">
                      {initialName || currentFlow?.flow_name || placeholder}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                      placeholder="Search flows..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {isLoading || flowsLoading ? 'Loading flows...' : 'No flows found'}
                    </CommandEmpty>


                    {/* Favorite flows */}
                    {favoriteFlows.length > 0 && (
                      <CommandGroup heading="Favorites">
                        {favoriteFlows.map((flow) => (
                          <CommandItem
                            key={flow.flow_id}
                            value={flow.flow_name}
                            onSelect={() => handleFlowSelect(flow)}
                            className="flex items-center justify-between p-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GitBranch size={14} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate font-medium">{flow.flow_name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock size={10} />
                                  <span>Updated {formatDate(flow.updated_at)}</span>
                                  {flow.status && (
                                    <Badge 
                                      variant={flow.status === 'active' ? "default" : "outline"}
                                      className="text-[10px] h-4 px-1"
                                    >
                                      {flow.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {id === flow.flow_id.toString() && (
                                <Check size={14} className="text-primary" />
                              )}
                              <button 
                                onClick={(e) => toggleFavorite(e, flow.flow_id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Star 
                                  size={12} 
                                  className="text-yellow-500" 
                                  fill="currentColor" 
                                />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(e, flow)}
                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                title="Delete flow"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {favoriteFlows.length > 0 && regularFlows.length > 0 && <CommandSeparator />}

                    {/* Regular flows */}
                    {regularFlows.length > 0 && (
                      <CommandGroup heading={favoriteFlows.length > 0 ? "All Flows" : undefined}>
                        {regularFlows.map((flow) => (
                          <CommandItem
                            key={flow.flow_id}
                            value={flow.flow_name}
                            onSelect={() => handleFlowSelect(flow)}
                            className="flex items-center justify-between p-2 cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GitBranch size={14} />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="truncate font-medium">{flow.flow_name}</span>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock size={10} />
                                  <span>Updated {formatDate(flow.updated_at)}</span>
                                  {flow.status && (
                                    <Badge 
                                      variant={flow.status === 'active' ? "default" : "outline"}
                                      className="text-[10px] h-4 px-1"
                                    >
                                      {flow.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {id === flow.flow_id.toString() && (
                                <Check size={14} className="text-primary" />
                              )}
                              <button 
                                onClick={(e) => toggleFavorite(e, flow.flow_id)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                <Star 
                                  size={12} 
                                  className={favorites.includes(flow.flow_id) 
                                    ? "text-yellow-500" 
                                    : "text-muted-foreground"
                                  }
                                  fill={favorites.includes(flow.flow_id) ? "currentColor" : "none"}
                                />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteClick(e, flow)}
                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-700"
                                title="Delete flow"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full h-7 w-7 p-1.5"
              onClick={() => setIsEditing(true)}
              aria-label="Edit flow name"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>

      {/* Create Flow Dialog */}
      <CreateFlowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Delete Flow Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Flow"
        description={`Are you sure you want to delete "${flowToDelete?.flow_name}"? This action cannot be undone and will permanently remove the flow and all associated data.`}
        confirmText={flowToDelete?.flow_name || ''}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteFlowMutation.isPending}
      />
    </>
  );
};